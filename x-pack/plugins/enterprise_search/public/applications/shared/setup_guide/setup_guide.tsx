/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import {
  EuiPage,
  EuiPageSideBar,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiIcon,
  EuiSteps,
  EuiCode,
  EuiCodeBlock,
  EuiAccordion,
  EuiLink,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';

import './setup_guide.scss';
import { prismAppName } from '../../../../../../derby/constants';

/**
 * Shared Setup Guide component. Sidebar content and product name/links are
 * customizable, but the basic layout and instruction steps are DRYed out
 */

interface ISetupGuideProps {
  children: React.ReactNode;
  productName: string;
  productEuiIcon: 'logoAppSearch' | 'logoWorkplaceSearch' | 'logoEnterpriseSearch';
  standardAuthLink?: string;
  elasticsearchNativeAuthLink?: string;
}

export const SetupGuide: React.FC<ISetupGuideProps> = ({
  children,
  productName,
  productEuiIcon,
  standardAuthLink,
  elasticsearchNativeAuthLink,
}) => (
  <EuiPage className="setupGuide">
    <EuiPageSideBar className="setupGuide__sidebar">
      <EuiText color="subdued" size="s">
        <strong>
          <FormattedMessage
            id="xpack.enterpriseSearch.setupGuide.title"
            defaultMessage="Setup Guide"
          />
        </strong>
      </EuiText>
      <EuiSpacer size="s" />

      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type={productEuiIcon} size="l" />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiTitle size="m">
            <h1>{productName}</h1>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>

      {children}
    </EuiPageSideBar>

    <EuiPageBody className="setupGuide__body">
      <EuiPageContent>
        <EuiSteps
          headingElement="h2"
          steps={[
            {
              title: i18n.translate('xpack.enterpriseSearch.setupGuide.step1.title', {
                defaultMessage: `Add your {productName} host URL to your ${prismAppName} configuration`, // DERBY sanitized
                values: { productName },
              }),
              children: (
                <EuiText>
                  <p>
                    <FormattedMessage
                      id="xpack.enterpriseSearch.setupGuide.step1.instruction1"
                      defaultMessage="In your {configFile} file, set {configSetting} to the URL of your {productName} instance. For example:"
                      values={{
                        productName,
                        configFile: <EuiCode>config/kibana.yml</EuiCode>,
                        configSetting: <EuiCode>enterpriseSearch.host</EuiCode>,
                      }}
                    />
                  </p>
                  <EuiCodeBlock language="yml">
                    enterpriseSearch.host: &apos;http://localhost:3002&apos;
                  </EuiCodeBlock>
                </EuiText>
              ),
            },
            {
              title: i18n.translate('xpack.enterpriseSearch.setupGuide.step2.title', {
                defaultMessage: `Reload your ${prismAppName} instance`, // DERBY sanitized
              }),
              children: (
                <EuiText>
                  <p>
                    <FormattedMessage
                      id="xpack.enterpriseSearch.setupGuide.step2.instruction1"
                      defaultMessage={`Restart ${prismAppName} to pick up the configuration changes from the previous step.`} // DERBY sanitized
                    />
                  </p>
                  <p>
                    <FormattedMessage
                      id="xpack.enterpriseSearch.setupGuide.step2.instruction2"
                      defaultMessage={`If you’re using {elasticsearchNativeAuthLink} in {productName}, you’re all set. Your users can now access {productName} in ${prismAppName} with their current {productName} access and permissions.`} // DERBY sanitized
                      values={{
                        productName,
                        elasticsearchNativeAuthLink: elasticsearchNativeAuthLink ? (
                          <EuiLink href={elasticsearchNativeAuthLink} target="_blank">
                            {
                              // DERBY sanitized
                            }
                            Native Auth
                          </EuiLink>
                        ) : (
                          'Native Auth' // DERBY sanitized
                        ),
                      }}
                    />
                  </p>
                </EuiText>
              ),
            },
            {
              title: i18n.translate('xpack.enterpriseSearch.setupGuide.step3.title', {
                defaultMessage: 'Troubleshooting issues',
              }),
              children: (
                <>
                  <EuiAccordion
                    buttonContent={i18n.translate(
                      'xpack.enterpriseSearch.troubleshooting.differentEsClusters.title',
                      {
                        defaultMessage: `{productName} and ${prismAppName} are on different clusters`, // DERBY sanitized
                        values: { productName },
                      }
                    )}
                    id="differentEsClusters"
                    paddingSize="s"
                  >
                    <EuiText>
                      <p>
                        <FormattedMessage
                          id="xpack.enterpriseSearch.troubleshooting.differentEsClusters.description"
                          defaultMessage={`This plugin does not currently support {productName} and ${prismAppName} running on different clusters.`} // DERBY sanitized
                          values={{ productName }}
                        />
                      </p>
                    </EuiText>
                  </EuiAccordion>
                  <EuiSpacer />
                  <EuiAccordion
                    buttonContent={i18n.translate(
                      'xpack.enterpriseSearch.troubleshooting.differentAuth.title',
                      {
                        defaultMessage: `{productName} and ${prismAppName} are on different authentication methods`, // DERBY sanitized
                        values: { productName },
                      }
                    )}
                    id="differentAuth"
                    paddingSize="s"
                  >
                    <EuiText>
                      <p>
                        <FormattedMessage
                          id="xpack.enterpriseSearch.troubleshooting.differentAuth.description"
                          defaultMessage={`This plugin does not currently support {productName} and ${prismAppName} operating on different authentication methods, for example, {productName} using a different SAML provider than ${prismAppName}.`} // DERBY sanitized
                          values={{ productName }}
                        />
                      </p>
                    </EuiText>
                  </EuiAccordion>
                  <EuiSpacer />
                  <EuiAccordion
                    buttonContent={i18n.translate(
                      'xpack.enterpriseSearch.troubleshooting.standardAuth.title',
                      {
                        defaultMessage: '{productName} on Standard authentication is not supported',
                        values: { productName },
                      }
                    )}
                    id="standardAuth"
                    paddingSize="s"
                  >
                    <EuiText>
                      <p>
                        <FormattedMessage
                          id="xpack.enterpriseSearch.troubleshooting.standardAuth.description"
                          defaultMessage={`This plugin does not fully support {productName} on {standardAuthLink}. Users created in {productName} must have ${prismAppName} access. Users created in ${prismAppName} will not see {productName} in the navigation menu.`} // DERBY sanitized
                          values={{
                            productName,
                            standardAuthLink: standardAuthLink ? (
                              <EuiLink href={standardAuthLink} target="_blank">
                                Standard Auth
                              </EuiLink>
                            ) : (
                              'Standard Auth'
                            ),
                          }}
                        />
                      </p>
                    </EuiText>
                  </EuiAccordion>
                </>
              ),
            },
          ]}
        />
      </EuiPageContent>
    </EuiPageBody>
  </EuiPage>
);
