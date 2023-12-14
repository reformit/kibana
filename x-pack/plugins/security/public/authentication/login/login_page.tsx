/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import './login_page.scss';

import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { BehaviorSubject } from 'rxjs';
import { parse } from 'url';
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiSpacer, EuiTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { CoreStart, FatalErrorsStart, HttpStart, NotificationsStart } from 'src/core/public';
import { LoginState } from '../../../common/login_state';
import { LoginForm, DisabledLoginForm } from './components';

interface Props {
  http: HttpStart;
  notifications: NotificationsStart;
  fatalErrors: FatalErrorsStart;
  loginAssistanceMessage: string;
}

interface State {
  loginState: LoginState | null;
}

const infoMessageMap = new Map([
  [
    'SESSION_EXPIRED',
    i18n.translate('xpack.security.login.sessionExpiredDescription', {
      defaultMessage: 'Your session has timed out. Please log in again.',
    }),
  ],
  [
    'LOGGED_OUT',
    i18n.translate('xpack.security.login.loggedOutDescription', {
      defaultMessage: 'You have logged out of PRISM.', // DERBY Sanitized
    }),
  ],
]);

export class LoginPage extends Component<Props, State> {
  state = { loginState: null } as State;

  public async componentDidMount() {
    const loadingCount$ = new BehaviorSubject(1);
    this.props.http.addLoadingCountSource(loadingCount$.asObservable());

    try {
      this.setState({ loginState: await this.props.http.get('/internal/security/login_state') });
    } catch (err) {
      this.props.fatalErrors.add(err);
    }

    loadingCount$.next(0);
    loadingCount$.complete();
  }

  public render() {
    const loginState = this.state.loginState;
    if (!loginState) {
      return null;
    }

    const isSecureConnection = !!window.location.protocol.match(/^https/);
    const { allowLogin, layout, requiresSecureConnection } = loginState;

    const loginIsSupported =
      requiresSecureConnection && !isSecureConnection ? false : allowLogin && layout === 'form';

    const contentHeaderClasses = classNames('loginWelcome__content', 'eui-textCenter', {
      ['loginWelcome__contentDisabledForm']: !loginIsSupported,
    });

    const contentBodyClasses = classNames('loginWelcome__content', 'loginWelcome-body', {
      ['loginWelcome__contentDisabledForm']: !loginIsSupported,
    });

    // DERBY Image
    const prismBase64Image =
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDEyMCAxMjAiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRlcmJ5LWxvZ28uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKDVkYTY4OWMzMTMsIDIwMTktMDEtMTQpIgogICB3aWR0aD0iMTIwIgogICBoZWlnaHQ9IjEyMCI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNjIyIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijk3MSIKICAgICBpZD0ibmFtZWR2aWV3NyIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6em9vbT0iMi44Mjg0MjcxIgogICAgIGlua3NjYXBlOmN4PSItMTguNTkxMDM3IgogICAgIGlua3NjYXBlOmN5PSI0Ny42NTI3NTUiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjE1MCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMTUzIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iZzgyNiIKICAgICB1bml0cz0icHgiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMzAiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyOCIgLz4KICA8ZwogICAgIGlkPSJnODI2IgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDczMzQ0NCwwLDAsMC40Njc0NDc4MywtMS41ODAyMDMsLTAuOTM0NTYwNTkpIj4KICAgIDxnCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iRGVyYnkgRCIKICAgICAgIGlkPSJsYXllcjMiPgogICAgICA8cGF0aAogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBpZD0icGF0aDM3MjYiCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC43NTAwMDAwMikiCiAgICAgICAgIGQ9Ik0gNC45NDAxNjg2LDMuMzUwMTQ4IFYgMzQ0LjQ1NTYxIGwgMzEuMzEyNTAwNCwwLjAyMTYgYyAyNy4yMDAwNjgsLTMuNjU0NiA1NC43MDA2NywtMTEuOTgxMjMgOTQuMDkzNzUxLC0yOS4zMDY3MyA1Mi41NzI4NCwtMjMuMTIyMTIgODEuODQyMjgsLTQ0LjAzMDYyIDEyMi4wMDc4MSwtODMuNDc2NTcgMzEuMSwtMzAuNTQyODIgNTYuNjU1NTIsLTcxLjAxNzA0IDcyLjc0MzQzLC0xMTAuNTg2NDcgNy41NTE0OCwtMTguNTczNDcgMTQuMTA5MjEsLTQwLjk2MTkyMiAxNi44ODAyOCwtNjIuNjM4MDA5IDAsMCAwLjIxMjg1LC0zNi45MTU1MjcgLTAuMDA3LC01NS4yOTc1MzYgeiBNIDEzOS4wMzEyNSw4Ni45MDAzOTEgYyAyNy44MjI1NSwtMy4yMmUtNCA1MC4zNzcyNywyMi41NTQzOTkgNTAuMzc2OTUsNTAuMzc2OTQ5IC03LjVlLTQsMjcuODIxNzkgLTIyLjU1NTE2LDUwLjM3NTMyIC01MC4zNzY5NSw1MC4zNzUgLTI3LjgyMTAzLC03LjVlLTQgLTUwLjM3NDI0NSwtMjIuNTUzOTcgLTUwLjM3NSwtNTAuMzc1IC0zLjIxZS00LC0yNy44MjE3OSAyMi41NTMyMSwtNTAuMzc2MTk0IDUwLjM3NSwtNTAuMzc2OTQ5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiM5OTk5NjY7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiM5OTk5NjY7c3Ryb2tlLXdpZHRoOjFweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjY3Nzc2NjY2NjY2NjIiAvPgogICAgPC9nPgogICAgPGcKICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJEZXJieSBBIgogICAgICAgaWQ9ImxheWVyNCIKICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjAwMTQxNTg5LDAuMTE2NzQ1NjcpIj4KICAgICAgPHBhdGgKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgaWQ9InBhdGg0NzIyIgogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNzUwMDAwMDIpIgogICAgICAgICBkPSJtIDM0MS45NzQ2MSwxMDguMTk1MzEgYyAwLDAgLTIyLjkyNDI1LDc5LjM0ODI4IC05MS4zMTU2OSwxNDIuMzM4MTIgLTgwLjIwOTgxLDczLjg3NDc4IC0xNjQuMTExMDczLDkzLjc2NzYzIC0xNjQuMTExMDczLDkzLjc2NzYzIGwgMTQyLjc1MzY1MywtMC4wMTM4IGMgLTAuMDE0NCwtMC4zMTEwNyAtMC4wMjU1LC0wLjgxMTcgLTAuMDMzMiwtMS4xMjMgNC4zZS00LC0yNC4yMTE5IDE5LjYyNzk0LC00My44Mzk0MSA0My44Mzk4NCwtNDMuODM5ODQgMjQuMjEyNjYsLTYuNWUtNCA0My44NDEzNywxOS42MjcxNyA0My44NDE4LDQzLjgzOTg0IC0wLjAxMzYsMC4zNjY3NSAtMC4wMSwwLjc1NTYgLTAuMDMyNywxLjEyMTg5IGwgMjUuMDY2NDEsMC4wNDY5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNkYTY3MTc7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiNkYTY3MTc7c3Ryb2tlLXdpZHRoOjEuMDAwNTk0NzQ7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNzY2NjY2NjY2MiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K';

    return (
      <div className="loginWelcome login-form">
        <header className="loginWelcome__header">
          <div className={contentHeaderClasses}>
            <EuiSpacer size="xxl" />
            <span className="loginWelcome__logo">
              <img
                src={prismBase64Image}
                alt="PRISM Logo"
                style={{ width: '40px', height: '40px' }}
              />
            </span>
            <EuiTitle size="m" className="loginWelcome__title">
              <Fragment>
                <h1 className="derbyLoginWelcome__title">
                  <FormattedMessage
                    id="xpack.security.loginPage.welcomeTitle"
                    defaultMessage="Derby PRISM"
                  />
                </h1>
                <h2 className="derbyLoginWelcome__subtitle">
                  <span>Making better decisions faster</span>
                </h2>
              </Fragment>
            </EuiTitle>
            <EuiSpacer size="xl" />
          </div>
        </header>
        <div className={contentBodyClasses}>
          <EuiFlexGroup gutterSize="l">
            <EuiFlexItem>{this.getLoginForm({ ...loginState, isSecureConnection })}</EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </div>
    );
  }

  private getLoginForm = ({
    layout,
    requiresSecureConnection,
    isSecureConnection,
    selector,
    loginHelp,
  }: LoginState & { isSecureConnection: boolean }) => {
    const isLoginExplicitlyDisabled = selector.providers.length === 0;
    if (isLoginExplicitlyDisabled) {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.noLoginMethodsAvailableTitle"
              defaultMessage="Login is disabled."
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.noLoginMethodsAvailableMessage"
              defaultMessage="Contact your system administrator."
            />
          }
        />
      );
    }

    if (requiresSecureConnection && !isSecureConnection) {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.requiresSecureConnectionTitle"
              defaultMessage="A secure connection is required for log in"
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.requiresSecureConnectionMessage"
              defaultMessage="Contact your system administrator."
            />
          }
        />
      );
    }

    if (layout === 'error-es-unavailable') {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.esUnavailableTitle"
              defaultMessage="Cannot connect to the Elasticsearch cluster"
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.esUnavailableMessage"
              defaultMessage="See the Kibana logs for details and try reloading the page."
            />
          }
        />
      );
    }

    if (layout === 'error-xpack-unavailable') {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.xpackUnavailableTitle"
              defaultMessage="Cannot connect to the Elasticsearch cluster currently configured for Kibana."
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.xpackUnavailableMessage"
              defaultMessage="To use the full set of free features in this distribution of Kibana, please update Elasticsearch to the default distribution."
            />
          }
        />
      );
    }

    if (layout !== 'form') {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.unknownLayoutTitle"
              defaultMessage="Unsupported login form layout."
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.unknownLayoutMessage"
              defaultMessage="See the Kibana logs for details and try reloading the page."
            />
          }
        />
      );
    }

    return (
      <LoginForm
        http={this.props.http}
        notifications={this.props.notifications}
        selector={selector}
        infoMessage={infoMessageMap.get(parse(window.location.href, true).query.msg?.toString())}
        loginAssistanceMessage={this.props.loginAssistanceMessage}
        loginHelp={loginHelp}
      />
    );
  };
}

export function renderLoginPage(i18nStart: CoreStart['i18n'], element: Element, props: Props) {
  ReactDOM.render(
    <i18nStart.Context>
      <LoginPage {...props} />
    </i18nStart.Context>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
}
