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

import React, { FunctionComponent, createElement } from 'react';

import { RenderingMetadata } from '../types';
import { Fonts } from './fonts';
import { Styles } from './styles';

interface Props {
  metadata: RenderingMetadata;
}

export const Template: FunctionComponent<Props> = ({
  metadata: {
    uiPublicUrl,
    locale,
    darkMode,
    injectedMetadata,
    i18n,
    bootstrapScriptUrl,
    strictCsp,
  },
}) => {
  // DERBY Image
  const logo = (
    <img
      style={{ width: '40px', height: '40px' }}
      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDEyMCAxMjAiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRlcmJ5LWxvZ28uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKDVkYTY4OWMzMTMsIDIwMTktMDEtMTQpIgogICB3aWR0aD0iMTIwIgogICBoZWlnaHQ9IjEyMCI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNjIyIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijk3MSIKICAgICBpZD0ibmFtZWR2aWV3NyIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6em9vbT0iMi44Mjg0MjcxIgogICAgIGlua3NjYXBlOmN4PSItMTguNTkxMDM3IgogICAgIGlua3NjYXBlOmN5PSI0Ny42NTI3NTUiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjE1MCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMTUzIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iZzgyNiIKICAgICB1bml0cz0icHgiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMzAiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyOCIgLz4KICA8ZwogICAgIGlkPSJnODI2IgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDczMzQ0NCwwLDAsMC40Njc0NDc4MywtMS41ODAyMDMsLTAuOTM0NTYwNTkpIj4KICAgIDxnCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iRGVyYnkgRCIKICAgICAgIGlkPSJsYXllcjMiPgogICAgICA8cGF0aAogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBpZD0icGF0aDM3MjYiCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC43NTAwMDAwMikiCiAgICAgICAgIGQ9Ik0gNC45NDAxNjg2LDMuMzUwMTQ4IFYgMzQ0LjQ1NTYxIGwgMzEuMzEyNTAwNCwwLjAyMTYgYyAyNy4yMDAwNjgsLTMuNjU0NiA1NC43MDA2NywtMTEuOTgxMjMgOTQuMDkzNzUxLC0yOS4zMDY3MyA1Mi41NzI4NCwtMjMuMTIyMTIgODEuODQyMjgsLTQ0LjAzMDYyIDEyMi4wMDc4MSwtODMuNDc2NTcgMzEuMSwtMzAuNTQyODIgNTYuNjU1NTIsLTcxLjAxNzA0IDcyLjc0MzQzLC0xMTAuNTg2NDcgNy41NTE0OCwtMTguNTczNDcgMTQuMTA5MjEsLTQwLjk2MTkyMiAxNi44ODAyOCwtNjIuNjM4MDA5IDAsMCAwLjIxMjg1LC0zNi45MTU1MjcgLTAuMDA3LC01NS4yOTc1MzYgeiBNIDEzOS4wMzEyNSw4Ni45MDAzOTEgYyAyNy44MjI1NSwtMy4yMmUtNCA1MC4zNzcyNywyMi41NTQzOTkgNTAuMzc2OTUsNTAuMzc2OTQ5IC03LjVlLTQsMjcuODIxNzkgLTIyLjU1NTE2LDUwLjM3NTMyIC01MC4zNzY5NSw1MC4zNzUgLTI3LjgyMTAzLC03LjVlLTQgLTUwLjM3NDI0NSwtMjIuNTUzOTcgLTUwLjM3NSwtNTAuMzc1IC0zLjIxZS00LC0yNy44MjE3OSAyMi41NTMyMSwtNTAuMzc2MTk0IDUwLjM3NSwtNTAuMzc2OTQ5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiM5OTk5NjY7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiM5OTk5NjY7c3Ryb2tlLXdpZHRoOjFweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjY3Nzc2NjY2NjY2NjIiAvPgogICAgPC9nPgogICAgPGcKICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJEZXJieSBBIgogICAgICAgaWQ9ImxheWVyNCIKICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjAwMTQxNTg5LDAuMTE2NzQ1NjcpIj4KICAgICAgPHBhdGgKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgaWQ9InBhdGg0NzIyIgogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNzUwMDAwMDIpIgogICAgICAgICBkPSJtIDM0MS45NzQ2MSwxMDguMTk1MzEgYyAwLDAgLTIyLjkyNDI1LDc5LjM0ODI4IC05MS4zMTU2OSwxNDIuMzM4MTIgLTgwLjIwOTgxLDczLjg3NDc4IC0xNjQuMTExMDczLDkzLjc2NzYzIC0xNjQuMTExMDczLDkzLjc2NzYzIGwgMTQyLjc1MzY1MywtMC4wMTM4IGMgLTAuMDE0NCwtMC4zMTEwNyAtMC4wMjU1LC0wLjgxMTcgLTAuMDMzMiwtMS4xMjMgNC4zZS00LC0yNC4yMTE5IDE5LjYyNzk0LC00My44Mzk0MSA0My44Mzk4NCwtNDMuODM5ODQgMjQuMjEyNjYsLTYuNWUtNCA0My44NDEzNywxOS42MjcxNyA0My44NDE4LDQzLjgzOTg0IC0wLjAxMzYsMC4zNjY3NSAtMC4wMSwwLjc1NTYgLTAuMDMyNywxLjEyMTg5IGwgMjUuMDY2NDEsMC4wNDY5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNkYTY3MTc7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiNkYTY3MTc7c3Ryb2tlLXdpZHRoOjEuMDAwNTk0NzQ7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNzY2NjY2NjY2MiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K"
      alt="PRISM Analytics Logo"
    />
  );
  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width" />
        <title>PRISM Analytics</title> {/* DERBY sanitized */}
        <Fonts url={uiPublicUrl} />
        {/* Favicons (generated from http://realfavicongenerator.net/) */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${uiPublicUrl}/favicons/apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${uiPublicUrl}/favicons/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${uiPublicUrl}/favicons/favicon-16x16.png`}
        />
        <link rel="manifest" href={`${uiPublicUrl}/favicons/manifest.json`} />
        <link
          rel="mask-icon"
          color="#e8488b"
          href={`${uiPublicUrl}/favicons/safari-pinned-tab.svg`}
        />
        <link rel="shortcut icon" href={`${uiPublicUrl}/favicons/favicon.ico`} />
        <meta name="msapplication-config" content={`${uiPublicUrl}/favicons/browserconfig.xml`} />
        <meta name="theme-color" content="#ffffff" />
        <Styles darkMode={darkMode} />
        {/* Inject stylesheets into the <head> before scripts so that KP plugins with bundled styles will override them */}
        <meta name="add-styles-here" />
        <meta name="add-scripts-here" />
      </head>
      <body>
        {createElement('kbn-csp', {
          data: JSON.stringify({ strictCsp }),
        })}
        {createElement('kbn-injected-metadata', { data: JSON.stringify(injectedMetadata) })}
        <div
          className="kbnWelcomeView"
          id="kbn_loading_message"
          style={{ display: 'none' }}
          data-test-subj="kbnLoadingMessage"
        >
          <div className="kbnLoaderWrap">
            {logo}
            <div
              className="kbnWelcomeText"
              data-error-message={i18n('core.ui.welcomeErrorMessage', {
                defaultMessage:
                  'PRISM Analytics did not load properly. Check the server output for more information.',
              })}
            >
              {i18n('core.ui.welcomeMessage', { defaultMessage: 'Loading PRISM Analytics' })}
            </div>
            <div className="kbnProgress" />
          </div>
        </div>

        <div className="kbnWelcomeView" id="kbn_legacy_browser_error" style={{ display: 'none' }}>
          {logo}

          <h2 className="kbnWelcomeTitle">
            {i18n('core.ui.legacyBrowserTitle', {
              defaultMessage: 'Please upgrade your browser',
            })}
          </h2>
          <div className="kbnWelcomeText">
            {i18n('core.ui.legacyBrowserMessage', {
              defaultMessage:
                'This PRISM Analytics installation has strict security requirements enabled that your current browser does not meet.',
            })}
          </div>
        </div>

        <script>
          {`
            // Since this is an unsafe inline script, this code will not run
            // in browsers that support content security policy(CSP). This is
            // intentional as we check for the existence of __kbnCspNotEnforced__ in
            // bootstrap.
            window.__kbnCspNotEnforced__ = true;
          `}
        </script>
        <script src={bootstrapScriptUrl} />
      </body>
    </html>
  );
};
