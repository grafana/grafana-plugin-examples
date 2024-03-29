import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { LinkButton, useStyles2 } from '@grafana/ui';
import { prefixRoute } from '../utils/utils.routing';
import { ROUTES } from '../constants';
import { PluginPage } from '@grafana/runtime';

export function PageOne() {
  const s = useStyles2(getStyles);

  return (
    <PluginPage>
      <div>
        This is page one.
        <div className={s.marginTop}>
          <LinkButton href={prefixRoute(ROUTES.Three)}>Full-width page example</LinkButton>
        </div>
      </div>
    </PluginPage>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
});
