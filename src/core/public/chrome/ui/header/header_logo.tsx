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

import '../../../../../../scss/derby_styles.scss';
import { i18n } from '@kbn/i18n';
import React from 'react';
import useObservable from 'react-use/lib/useObservable';
import { Observable } from 'rxjs';
import Url from 'url';
import { ChromeNavLink } from '../..';

function findClosestAnchor(element: HTMLElement): HTMLAnchorElement | void {
  let current = element;
  while (current) {
    if (current.tagName === 'A') {
      return current as HTMLAnchorElement;
    }

    if (!current.parentElement || current.parentElement === document.body) {
      return undefined;
    }

    current = current.parentElement;
  }
}

function onClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  forceNavigation: boolean,
  navLinks: ChromeNavLink[],
  navigateToApp: (appId: string) => void
) {
  const anchor = findClosestAnchor((event as any).nativeEvent.target);
  if (!anchor) {
    return;
  }

  const navLink = navLinks.find((item) => item.href === anchor.href);
  if (navLink && navLink.disabled) {
    event.preventDefault();
    return;
  }

  if (event.isDefaultPrevented() || event.altKey || event.metaKey || event.ctrlKey) {
    return;
  }

  if (forceNavigation) {
    const toParsed = Url.parse(anchor.href);
    const fromParsed = Url.parse(document.location.href);
    const sameProto = toParsed.protocol === fromParsed.protocol;
    const sameHost = toParsed.host === fromParsed.host;
    const samePath = toParsed.path === fromParsed.path;

    if (sameProto && sameHost && samePath) {
      if (toParsed.hash) {
        document.location.reload();
      }

      // event.preventDefault() keeps the browser from seeing the new url as an update
      // and even setting window.location does not mimic that behavior, so instead
      // we use stopPropagation() to prevent angular from seeing the click and
      // starting a digest cycle/attempting to handle it in the router.
      event.stopPropagation();
    }
  } else {
    navigateToApp('home');
    event.preventDefault();
  }
}

interface Props {
  href: string;
  navLinks$: Observable<ChromeNavLink[]>;
  forceNavigation$: Observable<boolean>;
  navigateToApp: (appId: string) => void;
}

export function HeaderLogo({ href, navigateToApp, ...observables }: Props) {
  const forceNavigation = useObservable(observables.forceNavigation$, false);
  const navLinks = useObservable(observables.navLinks$, []);

  const prismBase64Image =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDEyMCAxMjAiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRlcmJ5LWxvZ28uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKDVkYTY4OWMzMTMsIDIwMTktMDEtMTQpIgogICB3aWR0aD0iMTIwIgogICBoZWlnaHQ9IjEyMCI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNjIyIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijk3MSIKICAgICBpZD0ibmFtZWR2aWV3NyIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6em9vbT0iMi44Mjg0MjcxIgogICAgIGlua3NjYXBlOmN4PSItMTguNTkxMDM3IgogICAgIGlua3NjYXBlOmN5PSI0Ny42NTI3NTUiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjE1MCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMTUzIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iZzgyNiIKICAgICB1bml0cz0icHgiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMzAiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyOCIgLz4KICA8ZwogICAgIGlkPSJnODI2IgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDczMzQ0NCwwLDAsMC40Njc0NDc4MywtMS41ODAyMDMsLTAuOTM0NTYwNTkpIj4KICAgIDxnCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iRGVyYnkgRCIKICAgICAgIGlkPSJsYXllcjMiPgogICAgICA8cGF0aAogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBpZD0icGF0aDM3MjYiCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC43NTAwMDAwMikiCiAgICAgICAgIGQ9Ik0gNC45NDAxNjg2LDMuMzUwMTQ4IFYgMzQ0LjQ1NTYxIGwgMzEuMzEyNTAwNCwwLjAyMTYgYyAyNy4yMDAwNjgsLTMuNjU0NiA1NC43MDA2NywtMTEuOTgxMjMgOTQuMDkzNzUxLC0yOS4zMDY3MyA1Mi41NzI4NCwtMjMuMTIyMTIgODEuODQyMjgsLTQ0LjAzMDYyIDEyMi4wMDc4MSwtODMuNDc2NTcgMzEuMSwtMzAuNTQyODIgNTYuNjU1NTIsLTcxLjAxNzA0IDcyLjc0MzQzLC0xMTAuNTg2NDcgNy41NTE0OCwtMTguNTczNDcgMTQuMTA5MjEsLTQwLjk2MTkyMiAxNi44ODAyOCwtNjIuNjM4MDA5IDAsMCAwLjIxMjg1LC0zNi45MTU1MjcgLTAuMDA3LC01NS4yOTc1MzYgeiBNIDEzOS4wMzEyNSw4Ni45MDAzOTEgYyAyNy44MjI1NSwtMy4yMmUtNCA1MC4zNzcyNywyMi41NTQzOTkgNTAuMzc2OTUsNTAuMzc2OTQ5IC03LjVlLTQsMjcuODIxNzkgLTIyLjU1NTE2LDUwLjM3NTMyIC01MC4zNzY5NSw1MC4zNzUgLTI3LjgyMTAzLC03LjVlLTQgLTUwLjM3NDI0NSwtMjIuNTUzOTcgLTUwLjM3NSwtNTAuMzc1IC0zLjIxZS00LC0yNy44MjE3OSAyMi41NTMyMSwtNTAuMzc2MTk0IDUwLjM3NSwtNTAuMzc2OTQ5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiM5OTk5NjY7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiM5OTk5NjY7c3Ryb2tlLXdpZHRoOjFweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjY3Nzc2NjY2NjY2NjIiAvPgogICAgPC9nPgogICAgPGcKICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJEZXJieSBBIgogICAgICAgaWQ9ImxheWVyNCIKICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjAwMTQxNTg5LDAuMTE2NzQ1NjcpIj4KICAgICAgPHBhdGgKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgaWQ9InBhdGg0NzIyIgogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNzUwMDAwMDIpIgogICAgICAgICBkPSJtIDM0MS45NzQ2MSwxMDguMTk1MzEgYyAwLDAgLTIyLjkyNDI1LDc5LjM0ODI4IC05MS4zMTU2OSwxNDIuMzM4MTIgLTgwLjIwOTgxLDczLjg3NDc4IC0xNjQuMTExMDczLDkzLjc2NzYzIC0xNjQuMTExMDczLDkzLjc2NzYzIGwgMTQyLjc1MzY1MywtMC4wMTM4IGMgLTAuMDE0NCwtMC4zMTEwNyAtMC4wMjU1LC0wLjgxMTcgLTAuMDMzMiwtMS4xMjMgNC4zZS00LC0yNC4yMTE5IDE5LjYyNzk0LC00My44Mzk0MSA0My44Mzk4NCwtNDMuODM5ODQgMjQuMjEyNjYsLTYuNWUtNCA0My44NDEzNywxOS42MjcxNyA0My44NDE4LDQzLjgzOTg0IC0wLjAxMzYsMC4zNjY3NSAtMC4wMSwwLjc1NTYgLTAuMDMyNywxLjEyMTg5IGwgMjUuMDY2NDEsMC4wNDY5IHoiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNkYTY3MTc7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiNkYTY3MTc7c3Ryb2tlLXdpZHRoOjEuMDAwNTk0NzQ7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNzY2NjY2NjY2MiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K';

  return (
    /**
     * Added Derby Logo
     */
    <a
      href={href}
      className="derby-logo"
      onClick={(e) => onClick(e, forceNavigation, navLinks, navigateToApp)}
    >
      <img
        src={prismBase64Image}
        alt="PRISM Logo"
        style={{ width: '40px', height: '40px' }}
        aria-label={i18n.translate('core.ui.chrome.headerGlobalNav.goHomePageIconAriaLabel', {
          defaultMessage: 'Go to home page',
        })}
      />
      <span className="euiHeaderLogo__text">Derby PRISM</span>
    </a>
  );
}
