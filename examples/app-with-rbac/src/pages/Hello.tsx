import React from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';

export function Hello() {
  const s = useStyles2(getStyles);

  return (
    <PluginPage>
      <div data-testid={testIds.hello.container}>
        <h2>&#x1F44B; Welcome!</h2>
        <p>
          This mock plugin uses <span className={s.orange}>Role-Based Access Control (RBAC)</span> to control access to
          the following pages:
          <ul className={s.list}>
            <li>
              &#128196; Research Documents: Accessible to individuals with the{' '}
              <span className={s.orange}>grafana-appwithrbac-app.papers:read</span> permission, which is granted by
              default to <span className={s.orange}>Viewers</span>.
            </li>
            <li>
              &#x1F512; Patents: Accessible to individuals with the{' '}
              <span className={s.orange}>grafana-appwithrbac-app.patents:read</span> permission, which is granted by
              default to <span className={s.orange}>Administrators</span> only.
            </li>
          </ul>
        </p>
      </div>
    </PluginPage>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  list: css({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    padding: theme.spacing(1),
  }),

  orange: css({
    color: '#fbad37',
  }),
});
