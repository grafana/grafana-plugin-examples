import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, PageLayoutType } from '@grafana/data';
import { LinkButton, useStyles2 } from '@grafana/ui';
import { ROUTES } from '../constants';
import { prefixRoute } from '../utils/utils.routing';
import { PluginPage } from '@grafana/runtime';

export function PageThree() {
  const s = useStyles2(getStyles);

  return (
    <PluginPage layout={PageLayoutType.Canvas}>
      <div className={s.page}>
        <div className={s.container}>
          <LinkButton icon="arrow-left" href={prefixRoute(ROUTES.One)}>
            Back
          </LinkButton>
          <div className={s.content}>This is a full-width page without a navigation bar.</div>
        </div>
      </div>
    </PluginPage>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  page: css`
    padding: ${theme.spacing(3)};
    background-color: ${theme.colors.background.secondary};
    display: flex;
    justify-content: center;
  `,
  container: css`
    width: 900px;
    max-width: 100%;
    min-height: 500px;
  `,
  content: css`
    margin-top: ${theme.spacing(6)};
  `,
});
