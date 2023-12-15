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

import React, {
  Fragment,
  FunctionComponent,
  useLayoutEffect,
  useRef,
  useState,
  MutableRefObject,
} from 'react';

import type { MountPoint } from '../../types';
import { AppLeaveHandler, AppStatus, AppUnmount, Mounter } from '../types';
import { AppNotFound } from './app_not_found_screen';
import { ScopedHistory } from '../scoped_history';
import './app_container.scss';

interface Props {
  /** Path application is mounted on without the global basePath */
  appPath: string;
  appId: string;
  mounter?: Mounter;
  appStatus: AppStatus;
  setAppLeaveHandler: (appId: string, handler: AppLeaveHandler) => void;
  setAppActionMenu: (appId: string, mount: MountPoint | undefined) => void;
  createScopedHistory: (appUrl: string) => ScopedHistory;
  setIsMounting: (isMounting: boolean) => void;
}

export const AppContainer: FunctionComponent<Props> = ({
  mounter,
  appId,
  appPath,
  setAppLeaveHandler,
  setAppActionMenu,
  createScopedHistory,
  appStatus,
  setIsMounting,
}: Props) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [appNotFound, setAppNotFound] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const unmountRef: MutableRefObject<AppUnmount | null> = useRef<AppUnmount>(null);

  useLayoutEffect(() => {
    const unmount = () => {
      if (unmountRef.current) {
        unmountRef.current();
        unmountRef.current = null;
      }
    };

    if (!mounter || appStatus !== AppStatus.accessible) {
      return setAppNotFound(true);
    }
    setAppNotFound(false);

    setIsMounting(true);
    if (mounter.unmountBeforeMounting) {
      unmount();
    }

    const mount = async () => {
      setShowSpinner(true);
      try {
        unmountRef.current =
          (await mounter.mount({
            appBasePath: mounter.appBasePath,
            history: createScopedHistory(appPath),
            element: elementRef.current!,
            onAppLeave: (handler) => setAppLeaveHandler(appId, handler),
            setHeaderActionMenu: (menuMount) => setAppActionMenu(appId, menuMount),
          })) || null;
      } catch (e) {
        // TODO: add error UI
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (elementRef.current) {
          setShowSpinner(false);
          setIsMounting(false);
        }
      }
    };

    mount();

    return unmount;
  }, [
    appId,
    appStatus,
    mounter,
    createScopedHistory,
    setAppLeaveHandler,
    setAppActionMenu,
    appPath,
    setIsMounting,
  ]);

  // DERBY Image
  const prismBase64Image =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDEyMCAxMjAiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRlcmJ5LWxvZ28uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKDVkYTY4OWMzMTMsIDIwMTktMDEtMTQpIgogICB3aWR0aD0iMTIwIgogICBoZWlnaHQ9IjEyMCI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNjIyIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijk3MSIKICAgICBpZD0ibmFtZWR2aWV3NyIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6em9vbT0iMi44Mjg0MjcxIgogICAgIGlua3NjYXBlOmN4PSItMTguNTkxMDM3IgogICAgIGlua3NjYXBlOmN5PSI0Ny42NTI3NTUiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjE1MCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMTUzIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iZzgyNiIKICAgICB1bml0cz0icHgiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMzAiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyOCIgLz4KICA8ZwogICAgIGlkPSJnODI2IgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDczMzQ0NCwwLDAsMC40Njc0NDc4MywtMS41ODAyMDMsLTAuOTM0NTYwNTkpIj4KICAgIDxnCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iRGVyYnkgRCIKICAgICAgIGlkPSJsYXllcjMiPgogICAgICA8cGF0aAogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBpZD0icGF0aDM3MjYiCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC43NTAwMDAwMikiCiAgICAgICAgIGQ9Ik0gNC45NDAxNjg2LDMuMzUwMTQ4IFYgMzQ0LjQ1NTYxIGwgMzEuMzEyNTAwNCwwLjAyMTYgYyAyNy4yMDAwNjgsLTMuNjU0NiA1NC43MDA2NywtMTEuOTgxMjMgOTQuMDkzNzUxLC0yOS4zMDY3MyA1Mi41NzI4NCwtMjMuMTIyMTIgODEuODQyMjgsLTQ0LjAzMDYyIDEyMi4wMDc4MSwtODMuNDc2NTcgMzEuMSwtMzAuNTQyODIgNTYuNjU1NTIsLTcxLjAxNzA0IDcyLjc0MzQzLC0xMTAuNTg2NDcgNy41NTE0OCwtMTguNTczNDcgMTQuMTA5MjEsLTQwLjk2MTkyMiAxNi44ODAyOCwtNjIuNjM4MDA5IDAsMCAwLjIxMjg1LC0zNi45MTU1MjcgLTAuMDA3LC01NS4yOTc1MzYgeiBNIDEzOS4wMzEyNSw4Ni45MDAzOTEgYyAyNy44MjI1NSwtMy4yMmUtNCA1MC4zNzcyNywyMi41NTQzOTkgNTAuMzc2OTUsNTAuMzc2OTQ5IC03LjVlLTQsMjcuODIxNzkgLTIyLjU1NTE2LDUwLjM3NTMyIC01MC4zNzY5NSw1MC4zNzUgLTI3LjgyMTAzLC03LjVlLTQgLTUwLjM3NDI0NSwtMjIuNTUzOTcgLTUwLjM3NSwtNTAuMzc1IC0zLjIxZS00LC0yNy44MjE3OSAyMi41NTMyMSwtNTAuMzc2MTk0IDUwLjM3NSwtNTAuMzc2OTQ5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiM5OTk5NjY7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiM5OTk5NjY7c3Ryb2tlLXdpZHRoOjFweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjY3Nzc2NjY2NjY2NjIiAvPgogICAgPC9nPgogICAgPGcKICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJEZXJieSBBIgogICAgICAgaWQ9ImxheWVyNCIKICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjAwMTQxNTg5LDAuMTE2NzQ1NjcpIj4KICAgICAgPHBhdGgKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgaWQ9InBhdGg0NzIyIgogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNzUwMDAwMDIpIgogICAgICAgICBkPSJtIDM0MS45NzQ2MSwxMDguMTk1MzEgYyAwLDAgLTIyLjkyNDI1LDc5LjM0ODI4IC05MS4zMTU2OSwxNDIuMzM4MTIgLTgwLjIwOTgxLDczLjg3NDc4IC0xNjQuMTExMDczLDkzLjc2NzYzIC0xNjQuMTExMDczLDkzLjc2NzYzIGwgMTQyLjc1MzY1MywtMC4wMTM4IGMgLTAuMDE0NCwtMC4zMTEwNyAtMC4wMjU1LC0wLjgxMTcgLTAuMDMzMiwtMS4xMjMgNC4zZS00LC0yNC4yMTE5IDE5LjYyNzk0LC00My44Mzk0MSA0My44Mzk4NCwtNDMuODM5ODQgMjQuMjEyNjYsLTYuNWUtNCA0My44NDEzNywxOS42MjcxNyA0My44NDE4LDQzLjgzOTg0IC0wLjAxMzYsMC4zNjY3NSAtMC4wMSwwLjc1NTYgLTAuMDMyNywxLjEyMTg5IGwgMjUuMDY2NDEsMC4wNDY5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNkYTY3MTc7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiNkYTY3MTc7c3Ryb2tlLXdpZHRoOjEuMDAwNTk0NzQ7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNzY2NjY2NjY2MiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K';

  return (
    <Fragment>
      {appNotFound && <AppNotFound />}
      {showSpinner && (
        <div className="appContainer__loading">
          {/* <EuiLoadingElastic aria-label="Loading application" size="xxl" /> */}
          <img src={prismBase64Image} alt="PRISM Logo" style={{ width: '40px', height: '40px' }} />
        </div>
      )}
      <div key={appId} ref={elementRef} />
    </Fragment>
  );
};
