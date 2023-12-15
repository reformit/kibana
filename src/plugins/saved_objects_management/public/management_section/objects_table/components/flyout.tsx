/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component, Fragment, ReactNode } from 'react';
import { take, get as getField } from 'lodash';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiButtonEmpty,
  EuiButton,
  EuiText,
  EuiTitle,
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiInMemoryTable,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingElastic,
  EuiCallOut,
  EuiSpacer,
  EuiLink,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { OverlayStart, HttpStart } from 'src/core/public';
import {
  IndexPatternsContract,
  IIndexPattern,
  DataPublicPluginStart,
} from '../../../../../data/public';
import {
  importFile,
  importLegacyFile,
  resolveImportErrors,
  logLegacyImport,
  processImportResponse,
  ProcessedImportResponse,
} from '../../../lib';
import {
  resolveSavedObjects,
  resolveSavedSearches,
  resolveIndexPatternConflicts,
  saveObjects,
} from '../../../lib/resolve_saved_objects';
import { ISavedObjectsManagementServiceRegistry } from '../../../services';
import { FailedImportConflict, RetryDecision } from '../../../lib/resolve_import_errors';
import { OverwriteModal } from './overwrite_modal';
import { ImportModeControl, ImportMode } from './import_mode_control';
import { ImportSummary } from './import_summary';
import '../../../../../../../scss/derby_styles.scss';

const CREATE_NEW_COPIES_DEFAULT = false;
const OVERWRITE_ALL_DEFAULT = true;

export interface FlyoutProps {
  serviceRegistry: ISavedObjectsManagementServiceRegistry;
  allowedTypes: string[];
  close: () => void;
  done: () => void;
  newIndexPatternUrl: string;
  indexPatterns: IndexPatternsContract;
  overlays: OverlayStart;
  http: HttpStart;
  search: DataPublicPluginStart['search'];
}

export interface FlyoutState {
  conflictedIndexPatterns?: any[];
  conflictedSavedObjectsLinkedToSavedSearches?: any[];
  conflictedSearchDocs?: any[];
  unmatchedReferences?: ProcessedImportResponse['unmatchedReferences'];
  failedImports?: ProcessedImportResponse['failedImports'];
  successfulImports?: ProcessedImportResponse['successfulImports'];
  conflictingRecord?: ConflictingRecord;
  error?: string;
  file?: File;
  importCount: number;
  indexPatterns?: IIndexPattern[];
  importMode: ImportMode;
  loadingMessage?: string;
  isLegacyFile: boolean;
  status: string;
}

interface ConflictingRecord {
  conflict: FailedImportConflict;
  done: (result: [boolean, string | undefined]) => void;
}

const getErrorMessage = (e: any) => {
  const errorMessage =
    e.body?.error && e.body?.message ? `${e.body.error}: ${e.body.message}` : e.message;
  return i18n.translate('savedObjectsManagement.objectsTable.flyout.importFileErrorMessage', {
    defaultMessage: 'The file could not be processed due to error: "{error}"',
    values: {
      error: errorMessage,
    },
  });
};

export class Flyout extends Component<FlyoutProps, FlyoutState> {
  constructor(props: FlyoutProps) {
    super(props);

    this.state = {
      conflictedIndexPatterns: undefined,
      conflictedSavedObjectsLinkedToSavedSearches: undefined,
      conflictedSearchDocs: undefined,
      unmatchedReferences: undefined,
      conflictingRecord: undefined,
      error: undefined,
      file: undefined,
      importCount: 0,
      indexPatterns: undefined,
      importMode: { createNewCopies: CREATE_NEW_COPIES_DEFAULT, overwrite: OVERWRITE_ALL_DEFAULT },
      loadingMessage: undefined,
      isLegacyFile: false,
      status: 'idle',
    };
  }

  componentDidMount() {
    this.fetchIndexPatterns();
  }

  fetchIndexPatterns = async () => {
    const indexPatterns = (await this.props.indexPatterns.getCache())?.map((savedObject) => ({
      id: savedObject.id,
      title: savedObject.attributes.title,
    }));
    this.setState({ indexPatterns } as any);
  };

  changeImportMode = (importMode: FlyoutState['importMode']) => {
    this.setState(() => ({ importMode }));
  };

  setImportFile = (files: FileList | null) => {
    if (!files || !files[0]) {
      this.setState({ file: undefined, isLegacyFile: false });
      return;
    }
    const file = files[0];
    this.setState({
      file,
      isLegacyFile: /\.json$/i.test(file.name) || file.type === 'application/json',
    });
  };

  /**
   * Import
   *
   * Does the initial import of a file, resolveImportErrors then handles errors and retries
   */
  import = async () => {
    const { http } = this.props;
    const { file, importMode } = this.state;
    this.setState({ status: 'loading', error: undefined });

    // Import the file
    try {
      const response = await importFile(http, file!, importMode);
      this.setState(processImportResponse(response), () => {
        // Resolve import errors right away if there's no index patterns to match
        // This will ask about overwriting each object, etc
        if (this.state.unmatchedReferences?.length === 0) {
          this.resolveImportErrors();
        }
      });
    } catch (e) {
      this.setState({
        status: 'error',
        error: getErrorMessage(e),
      });
      return;
    }
  };

  /**
   * Get Conflict Resolutions
   *
   * Function iterates through the objects, displays a modal for each asking the user if they wish to overwrite it or not.
   *
   * @param {array} failures List of objects to request the user if they wish to overwrite it
   * @return {Promise<array>} An object with the key being "type:id" and value the resolution chosen by the user
   */
  getConflictResolutions = async (failures: FailedImportConflict[]) => {
    const resolutions: Record<string, RetryDecision> = {};
    for (const conflict of failures) {
      const [overwrite, destinationId] = await new Promise<[boolean, string | undefined]>(
        (done) => {
          this.setState({ conflictingRecord: { conflict, done } });
        }
      );
      if (overwrite) {
        const { type, id } = conflict.obj;
        resolutions[`${type}:${id}`] = {
          retry: true,
          options: { overwrite: true, ...(destinationId && { destinationId }) },
        };
      }
      this.setState({ conflictingRecord: undefined });
    }
    return resolutions;
  };

  /**
   * Resolve Import Errors
   *
   * Function goes through the failedImports and tries to resolve the issues.
   */
  resolveImportErrors = async () => {
    this.setState({
      error: undefined,
      status: 'loading',
      loadingMessage: undefined,
    });

    try {
      const updatedState = await resolveImportErrors({
        http: this.props.http,
        state: this.state,
        getConflictResolutions: this.getConflictResolutions,
      });
      this.setState(updatedState);
    } catch (e) {
      this.setState({
        status: 'error',
        error: getErrorMessage(e),
      });
    }
  };

  legacyImport = async () => {
    const { serviceRegistry, indexPatterns, overlays, http, allowedTypes } = this.props;
    const { file, importMode } = this.state;

    this.setState({ status: 'loading', error: undefined });

    // Log warning on server, don't wait for response
    logLegacyImport(http);

    let contents;
    try {
      contents = await importLegacyFile(file!);
    } catch (e) {
      this.setState({
        status: 'error',
        error: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.importLegacyFileErrorMessage',
          { defaultMessage: 'The file could not be processed.' }
        ),
      });
      return;
    }

    if (!Array.isArray(contents)) {
      this.setState({
        status: 'error',
        error: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.invalidFormatOfImportedFileErrorMessage',
          { defaultMessage: 'Saved objects file format is invalid and cannot be imported.' }
        ),
      });
      return;
    }

    contents = contents
      .filter((content) => allowedTypes.includes(content._type))
      .map((doc) => ({
        ...doc,
        // The server assumes that documents with no migrationVersion are up to date.
        // That assumption enables Kibana and other API consumers to not have to build
        // up migrationVersion prior to creating new objects. But it means that imports
        // need to set migrationVersion to something other than undefined, so that imported
        // docs are not seen as automatically up-to-date.
        _migrationVersion: doc._migrationVersion || {},
      }));

    const {
      conflictedIndexPatterns,
      conflictedSavedObjectsLinkedToSavedSearches,
      conflictedSearchDocs,
      importedObjectCount,
      failedImports,
    } = await resolveSavedObjects(
      contents,
      importMode.overwrite,
      serviceRegistry.all().map((e) => e.service),
      indexPatterns,
      overlays.openConfirm
    );

    const byId: Record<string, any[]> = {};
    conflictedIndexPatterns
      .map(({ doc, obj }) => {
        return { doc, obj: obj._serialize() };
      })
      .forEach(({ doc, obj }) =>
        obj.references.forEach((ref: Record<string, any>) => {
          byId[ref.id] = byId[ref.id] != null ? byId[ref.id].concat({ doc, obj }) : [{ doc, obj }];
        })
      );
    const unmatchedReferences = Object.entries(byId).reduce(
      (accum, [existingIndexPatternId, list]) => {
        accum.push({
          existingIndexPatternId,
          newIndexPatternId: undefined,
          list: list.map(({ doc }) => ({
            id: existingIndexPatternId,
            type: doc._type,
            title: doc._source.title,
          })),
        });
        return accum;
      },
      [] as any[]
    );

    this.setState({
      conflictedIndexPatterns,
      conflictedSavedObjectsLinkedToSavedSearches,
      conflictedSearchDocs,
      failedImports,
      unmatchedReferences,
      importCount: importedObjectCount,
      status: unmatchedReferences.length === 0 ? 'success' : 'idle',
    });
  };

  public get hasUnmatchedReferences() {
    return this.state.unmatchedReferences && this.state.unmatchedReferences.length > 0;
  }

  public get resolutions() {
    return this.state.unmatchedReferences!.reduce(
      (accum, { existingIndexPatternId, newIndexPatternId }) => {
        if (newIndexPatternId) {
          accum.push({
            oldId: existingIndexPatternId,
            newId: newIndexPatternId,
          });
        }
        return accum;
      },
      [] as Array<{ oldId: string; newId: string }>
    );
  }

  confirmLegacyImport = async () => {
    const {
      conflictedIndexPatterns,
      importMode,
      conflictedSavedObjectsLinkedToSavedSearches,
      conflictedSearchDocs,
      failedImports,
    } = this.state;

    const { serviceRegistry, indexPatterns, search } = this.props;

    this.setState({
      error: undefined,
      status: 'loading',
      loadingMessage: undefined,
    });

    let importCount = this.state.importCount;

    if (this.hasUnmatchedReferences) {
      try {
        const resolutions = this.resolutions;

        // Do not Promise.all these calls as the order matters
        this.setState({
          loadingMessage: i18n.translate(
            'savedObjectsManagement.objectsTable.flyout.confirmLegacyImport.resolvingConflictsLoadingMessage',
            { defaultMessage: 'Resolving conflicts…' }
          ),
        });
        if (resolutions.length) {
          importCount += await resolveIndexPatternConflicts(
            resolutions,
            conflictedIndexPatterns!,
            importMode.overwrite,
            { indexPatterns, search }
          );
        }
        this.setState({
          loadingMessage: i18n.translate(
            'savedObjectsManagement.objectsTable.flyout.confirmLegacyImport.savingConflictsLoadingMessage',
            { defaultMessage: 'Saving conflicts…' }
          ),
        });
        importCount += await saveObjects(
          conflictedSavedObjectsLinkedToSavedSearches!,
          importMode.overwrite
        );
        this.setState({
          loadingMessage: i18n.translate(
            'savedObjectsManagement.objectsTable.flyout.confirmLegacyImport.savedSearchAreLinkedProperlyLoadingMessage',
            { defaultMessage: 'Ensure saved searches are linked properly…' }
          ),
        });
        importCount += await resolveSavedSearches(
          conflictedSearchDocs!,
          serviceRegistry.all().map((e) => e.service),
          indexPatterns,
          importMode.overwrite
        );
        this.setState({
          loadingMessage: i18n.translate(
            'savedObjectsManagement.objectsTable.flyout.confirmLegacyImport.retryingFailedObjectsLoadingMessage',
            { defaultMessage: 'Retrying failed objects…' }
          ),
        });
        importCount += await saveObjects(
          failedImports!.map(({ obj }) => obj) as any[],
          importMode.overwrite
        );
      } catch (e) {
        this.setState({
          status: 'error',
          error: getErrorMessage(e),
          loadingMessage: undefined,
        });
        return;
      }
    }

    this.setState({ status: 'success', importCount });
  };

  onIndexChanged = (id: string, e: any) => {
    const value = e.target.value;
    this.setState((state) => {
      const conflictIndex = state.unmatchedReferences?.findIndex(
        (conflict) => conflict.existingIndexPatternId === id
      );
      if (conflictIndex === undefined || conflictIndex === -1) {
        return state;
      }

      return {
        unmatchedReferences: [
          ...state.unmatchedReferences!.slice(0, conflictIndex),
          {
            ...state.unmatchedReferences![conflictIndex],
            newIndexPatternId: value,
          },
          ...state.unmatchedReferences!.slice(conflictIndex + 1),
        ],
      } as any;
    });
  };

  renderUnmatchedReferences() {
    const { unmatchedReferences } = this.state;

    if (!unmatchedReferences) {
      return null;
    }

    const columns = [
      {
        field: 'existingIndexPatternId',
        name: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.renderConflicts.columnIdName',
          { defaultMessage: 'ID' }
        ),
        description: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.renderConflicts.columnIdDescription',
          { defaultMessage: 'ID of the index pattern' }
        ),
        sortable: true,
      },
      {
        field: 'list',
        name: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.renderConflicts.columnCountName',
          { defaultMessage: 'Count' }
        ),
        description: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.renderConflicts.columnCountDescription',
          { defaultMessage: 'How many affected objects' }
        ),
        render: (list: any[]) => {
          return <Fragment>{list.length}</Fragment>;
        },
      },
      {
        field: 'list',
        name: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.renderConflicts.columnSampleOfAffectedObjectsName',
          { defaultMessage: 'Sample of affected objects' }
        ),
        description: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.renderConflicts.columnSampleOfAffectedObjectsDescription',
          { defaultMessage: 'Sample of affected objects' }
        ),
        render: (list: any[]) => {
          return (
            <ul style={{ listStyle: 'none' }}>
              {take(list, 3).map((obj, key) => (
                <li key={key}>{obj.title}</li>
              ))}
            </ul>
          );
        },
      },
      {
        field: 'existingIndexPatternId',
        name: i18n.translate(
          'savedObjectsManagement.objectsTable.flyout.renderConflicts.columnNewIndexPatternName',
          { defaultMessage: 'New index pattern' }
        ),
        render: (id: string) => {
          const options = this.state.indexPatterns!.map(
            (indexPattern) =>
              ({
                text: indexPattern.title,
                value: indexPattern.id,
                'data-test-subj': `indexPatternOption-${indexPattern.title}`,
              } as { text: string; value: string; 'data-test-subj'?: string })
          );

          options.unshift({
            text: '-- Skip Import --',
            value: '',
          });

          return (
            <EuiSelect
              data-test-subj={`managementChangeIndexSelection-${id}`}
              onChange={(e) => this.onIndexChanged(id, e)}
              options={options}
            />
          );
        },
      },
    ];

    const pagination = {
      pageSizeOptions: [5, 10, 25],
    };

    return (
      <EuiInMemoryTable
        items={unmatchedReferences as any[]}
        columns={columns}
        pagination={pagination}
      />
    );
  }

  renderError() {
    const { error, status } = this.state;

    if (status !== 'error') {
      return null;
    }

    return (
      <Fragment>
        <EuiCallOut
          title={
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.errorCalloutTitle"
              defaultMessage="Sorry, there was an error"
            />
          }
          color="danger"
        >
          <p data-test-subj="importSavedObjectsErrorText">{error}</p>
        </EuiCallOut>
        <EuiSpacer size="s" />
      </Fragment>
    );
  }

  renderBody() {
    const {
      status,
      loadingMessage,
      importCount,
      failedImports = [],
      successfulImports = [],
      isLegacyFile,
      importMode,
    } = this.state;

    // DERBY Image
    const prismBase64Image =
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDEyMCAxMjAiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRlcmJ5LWxvZ28uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKDVkYTY4OWMzMTMsIDIwMTktMDEtMTQpIgogICB3aWR0aD0iMTIwIgogICBoZWlnaHQ9IjEyMCI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNjIyIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijk3MSIKICAgICBpZD0ibmFtZWR2aWV3NyIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6em9vbT0iMi44Mjg0MjcxIgogICAgIGlua3NjYXBlOmN4PSItMTguNTkxMDM3IgogICAgIGlua3NjYXBlOmN5PSI0Ny42NTI3NTUiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjE1MCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMTUzIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iZzgyNiIKICAgICB1bml0cz0icHgiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMzAiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyOCIgLz4KICA8ZwogICAgIGlkPSJnODI2IgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDczMzQ0NCwwLDAsMC40Njc0NDc4MywtMS41ODAyMDMsLTAuOTM0NTYwNTkpIj4KICAgIDxnCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iRGVyYnkgRCIKICAgICAgIGlkPSJsYXllcjMiPgogICAgICA8cGF0aAogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBpZD0icGF0aDM3MjYiCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC43NTAwMDAwMikiCiAgICAgICAgIGQ9Ik0gNC45NDAxNjg2LDMuMzUwMTQ4IFYgMzQ0LjQ1NTYxIGwgMzEuMzEyNTAwNCwwLjAyMTYgYyAyNy4yMDAwNjgsLTMuNjU0NiA1NC43MDA2NywtMTEuOTgxMjMgOTQuMDkzNzUxLC0yOS4zMDY3MyA1Mi41NzI4NCwtMjMuMTIyMTIgODEuODQyMjgsLTQ0LjAzMDYyIDEyMi4wMDc4MSwtODMuNDc2NTcgMzEuMSwtMzAuNTQyODIgNTYuNjU1NTIsLTcxLjAxNzA0IDcyLjc0MzQzLC0xMTAuNTg2NDcgNy41NTE0OCwtMTguNTczNDcgMTQuMTA5MjEsLTQwLjk2MTkyMiAxNi44ODAyOCwtNjIuNjM4MDA5IDAsMCAwLjIxMjg1LC0zNi45MTU1MjcgLTAuMDA3LC01NS4yOTc1MzYgeiBNIDEzOS4wMzEyNSw4Ni45MDAzOTEgYyAyNy44MjI1NSwtMy4yMmUtNCA1MC4zNzcyNywyMi41NTQzOTkgNTAuMzc2OTUsNTAuMzc2OTQ5IC03LjVlLTQsMjcuODIxNzkgLTIyLjU1NTE2LDUwLjM3NTMyIC01MC4zNzY5NSw1MC4zNzUgLTI3LjgyMTAzLC03LjVlLTQgLTUwLjM3NDI0NSwtMjIuNTUzOTcgLTUwLjM3NSwtNTAuMzc1IC0zLjIxZS00LC0yNy44MjE3OSAyMi41NTMyMSwtNTAuMzc2MTk0IDUwLjM3NSwtNTAuMzc2OTQ5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiM5OTk5NjY7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiM5OTk5NjY7c3Ryb2tlLXdpZHRoOjFweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjY3Nzc2NjY2NjY2NjIiAvPgogICAgPC9nPgogICAgPGcKICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJEZXJieSBBIgogICAgICAgaWQ9ImxheWVyNCIKICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjAwMTQxNTg5LDAuMTE2NzQ1NjcpIj4KICAgICAgPHBhdGgKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgaWQ9InBhdGg0NzIyIgogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNzUwMDAwMDIpIgogICAgICAgICBkPSJtIDM0MS45NzQ2MSwxMDguMTk1MzEgYyAwLDAgLTIyLjkyNDI1LDc5LjM0ODI4IC05MS4zMTU2OSwxNDIuMzM4MTIgLTgwLjIwOTgxLDczLjg3NDc4IC0xNjQuMTExMDczLDkzLjc2NzYzIC0xNjQuMTExMDczLDkzLjc2NzYzIGwgMTQyLjc1MzY1MywtMC4wMTM4IGMgLTAuMDE0NCwtMC4zMTEwNyAtMC4wMjU1LC0wLjgxMTcgLTAuMDMzMiwtMS4xMjMgNC4zZS00LC0yNC4yMTE5IDE5LjYyNzk0LC00My44Mzk0MSA0My44Mzk4NCwtNDMuODM5ODQgMjQuMjEyNjYsLTYuNWUtNCA0My44NDEzNywxOS42MjcxNyA0My44NDE4LDQzLjgzOTg0IC0wLjAxMzYsMC4zNjY3NSAtMC4wMSwwLjc1NTYgLTAuMDMyNywxLjEyMTg5IGwgMjUuMDY2NDEsMC4wNDY5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNkYTY3MTc7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiNkYTY3MTc7c3Ryb2tlLXdpZHRoOjEuMDAwNTk0NzQ7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNzY2NjY2NjY2MiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K';

    if (status === 'loading') {
      return (
        <EuiFlexGroup justifyContent="spaceAround">
          <EuiFlexItem grow={false}>
            {/* Derby Changed to PRISM Logo */}
            <div className="derby-saved-objects-import-loading">
              <img
                src={prismBase64Image}
                alt="PRISM Analytics Logo"
                style={{ width: '20px', height: '20px' }}
                aria-label={i18n.translate(
                  'core.ui.chrome.headerGlobalNav.goHomePageIconAriaLabel',
                  {
                    defaultMessage: 'Go to home page',
                  }
                )}
              />
              <div className="derby-loading-text derby-flashing-text">Loading ...</div>
            </div>
            <EuiSpacer size="m" />
            <EuiText>
              <p>{loadingMessage}</p>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }

    if (isLegacyFile === false && status === 'success') {
      return <ImportSummary failedImports={failedImports} successfulImports={successfulImports} />;
    }

    // Import summary for failed legacy import
    if (failedImports.length && !this.hasUnmatchedReferences) {
      return (
        <EuiCallOut
          data-test-subj="importSavedObjectsFailedWarning"
          title={
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.importFailedTitle"
              defaultMessage="Import failed"
            />
          }
          color="warning"
          iconType="help"
        >
          <p>
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.importFailedDescription"
              defaultMessage="Failed to import {failedImportCount} of {totalImportCount} objects. Import failed"
              values={{
                failedImportCount: failedImports.length,
                totalImportCount: importCount + failedImports.length,
              }}
            />
          </p>
          <p>
            {failedImports
              .map(({ error, obj }) => {
                if (error.type === 'missing_references') {
                  return error.references.map((reference) => {
                    return i18n.translate(
                      'savedObjectsManagement.objectsTable.flyout.importFailedMissingReference',
                      {
                        defaultMessage: '{type} [id={id}] could not locate {refType} [id={refId}]',
                        values: {
                          id: obj.id,
                          type: obj.type,
                          refId: reference.id,
                          refType: reference.type,
                        },
                      }
                    );
                  });
                } else if (error.type === 'unsupported_type') {
                  return i18n.translate(
                    'savedObjectsManagement.objectsTable.flyout.importFailedUnsupportedType',
                    {
                      defaultMessage: '{type} [id={id}] unsupported type',
                      values: {
                        id: obj.id,
                        type: obj.type,
                      },
                    }
                  );
                }
                return getField(error, 'body.message', (error as any).message ?? '');
              })
              .join(' ')}
          </p>
        </EuiCallOut>
      );
    }

    // Import summary for completed legacy import
    if (status === 'success') {
      if (importCount === 0) {
        return (
          <EuiCallOut
            data-test-subj="importSavedObjectsSuccessNoneImported"
            title={
              <FormattedMessage
                id="savedObjectsManagement.objectsTable.flyout.importSuccessfulCallout.noObjectsImportedTitle"
                defaultMessage="No objects imported"
              />
            }
            color="primary"
          />
        );
      }

      return (
        <EuiCallOut
          data-test-subj="importSavedObjectsSuccess"
          title={
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.importSuccessfulTitle"
              defaultMessage="Import successful"
            />
          }
          color="success"
          iconType="check"
        >
          <p>
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.importSuccessfulDescription"
              defaultMessage="Successfully imported {importCount} objects."
              values={{ importCount }}
            />
          </p>
        </EuiCallOut>
      );
    }

    if (this.hasUnmatchedReferences) {
      return this.renderUnmatchedReferences();
    }

    return (
      <EuiForm>
        <EuiFormRow
          fullWidth
          label={
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.selectFileToImportFormRowLabel"
              defaultMessage="Select a file to import"
            />
          }
        >
          <EuiFilePicker
            accept=".ndjson, .json"
            fullWidth
            initialPromptText={
              <FormattedMessage
                id="savedObjectsManagement.objectsTable.flyout.importPromptText"
                defaultMessage="Import"
              />
            }
            onChange={this.setImportFile}
          />
        </EuiFormRow>
        <EuiFormRow fullWidth>
          <ImportModeControl
            initialValues={importMode}
            isLegacyFile={isLegacyFile}
            updateSelection={(newValues: ImportMode) => this.changeImportMode(newValues)}
          />
        </EuiFormRow>
      </EuiForm>
    );
  }

  renderFooter() {
    const { isLegacyFile, status } = this.state;
    const { done, close } = this.props;

    let confirmButton;

    if (status === 'success') {
      confirmButton = (
        <EuiButton onClick={done} size="s" fill data-test-subj="importSavedObjectsDoneBtn">
          <FormattedMessage
            id="savedObjectsManagement.objectsTable.flyout.importSuccessful.confirmButtonLabel"
            defaultMessage="Done"
          />
        </EuiButton>
      );
    } else if (this.hasUnmatchedReferences) {
      confirmButton = (
        <EuiButton
          onClick={isLegacyFile ? this.confirmLegacyImport : this.resolveImportErrors}
          size="s"
          fill
          isLoading={status === 'loading'}
          data-test-subj="importSavedObjectsConfirmBtn"
        >
          <FormattedMessage
            id="savedObjectsManagement.objectsTable.flyout.importSuccessful.confirmAllChangesButtonLabel"
            defaultMessage="Confirm all changes"
          />
        </EuiButton>
      );
    } else {
      confirmButton = (
        <EuiButton
          onClick={isLegacyFile ? this.legacyImport : this.import}
          size="s"
          fill
          isLoading={status === 'loading'}
          data-test-subj="importSavedObjectsImportBtn"
        >
          <FormattedMessage
            id="savedObjectsManagement.objectsTable.flyout.import.confirmButtonLabel"
            defaultMessage="Import"
          />
        </EuiButton>
      );
    }

    return (
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            onClick={close}
            size="s"
            disabled={status === 'loading' || (isLegacyFile === false && status === 'success')}
            data-test-subj="importSavedObjectsCancelBtn"
          >
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.import.cancelButtonLabel"
              defaultMessage="Cancel"
            />
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>{confirmButton}</EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  renderSubheader() {
    if (this.state.status === 'loading' || this.state.status === 'success') {
      return null;
    }

    let legacyFileWarning;
    if (this.state.isLegacyFile) {
      legacyFileWarning = (
        <>
          <EuiCallOut
            data-test-subj="importSavedObjectsLegacyWarning"
            title={
              <FormattedMessage
                id="savedObjectsManagement.objectsTable.flyout.legacyFileUsedTitle"
                defaultMessage="Support for JSON files is going away"
              />
            }
            color="warning"
            iconType="help"
          >
            <p>
              <FormattedMessage
                id="savedObjectsManagement.objectsTable.flyout.legacyFileUsedBody"
                defaultMessage="Use our updated export to generate NDJSON files, and you'll be all set."
              />
            </p>
          </EuiCallOut>
          <EuiSpacer size="m" />
        </>
      );
    }

    let indexPatternConflictsWarning;
    if (this.hasUnmatchedReferences) {
      indexPatternConflictsWarning = (
        <EuiCallOut
          data-test-subj="importSavedObjectsConflictsWarning"
          title={
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.indexPatternConflictsTitle"
              defaultMessage="Index Pattern Conflicts"
            />
          }
          color="warning"
          iconType="help"
        >
          <p>
            <FormattedMessage
              id="savedObjectsManagement.objectsTable.flyout.indexPatternConflictsDescription"
              defaultMessage="The following saved objects use index patterns that do not exist.
              Please select the index patterns you'd like re-associated with
              them. You can {indexPatternLink} if necessary."
              values={{
                indexPatternLink: (
                  <EuiLink href={this.props.newIndexPatternUrl}>
                    <FormattedMessage
                      id="savedObjectsManagement.objectsTable.flyout.indexPatternConflictsCalloutLinkText"
                      defaultMessage="create a new index pattern"
                    />
                  </EuiLink>
                ),
              }}
            />
          </p>
        </EuiCallOut>
      );
    }

    if (!legacyFileWarning && !indexPatternConflictsWarning) {
      return null;
    }

    return (
      <Fragment>
        {legacyFileWarning && (
          <span>
            <EuiSpacer size="s" />
            {legacyFileWarning}
          </span>
        )}
        {indexPatternConflictsWarning && (
          <span>
            <EuiSpacer size="s" />
            {indexPatternConflictsWarning}
          </span>
        )}
      </Fragment>
    );
  }

  render() {
    const { close } = this.props;

    let confirmOverwriteModal: ReactNode;
    const { conflictingRecord } = this.state;
    if (conflictingRecord) {
      const { conflict } = conflictingRecord;
      const onFinish = (overwrite: boolean, destinationId?: string) =>
        conflictingRecord.done([overwrite, destinationId]);
      confirmOverwriteModal = <OverwriteModal {...{ conflict, onFinish }} />;
    }

    return (
      <EuiFlyout onClose={close} size="s">
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2>
              <FormattedMessage
                id="savedObjectsManagement.objectsTable.flyout.importSavedObjectTitle"
                defaultMessage="Import saved objects"
              />
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          {this.renderSubheader()}
          {this.renderError()}
          {this.renderBody()}
        </EuiFlyoutBody>

        <EuiFlyoutFooter>{this.renderFooter()}</EuiFlyoutFooter>
        {confirmOverwriteModal}
      </EuiFlyout>
    );
  }
}
