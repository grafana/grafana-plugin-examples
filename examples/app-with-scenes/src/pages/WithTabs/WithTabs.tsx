import React, { useMemo } from 'react';
import { SceneApp, SceneAppPage } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import { testIds } from '../../components/testIds';
import { getBasicScene } from '../Home/scenes';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

const getTab1Scene = () => {
  return getBasicScene(false, '__server_names');
};

const getTab2Scene = () => {
  return getBasicScene(false, '__house_locations');
};

const getScene = () =>
  new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'Page with tabs',
        subTitle: 'This scene showcases a basic tabs functionality.',
        // Important: Mind the page route is ambiguous for the tabs to work properly
        url: prefixRoute(`${ROUTES.WithTabs}`),
        hideFromBreadcrumbs: true,
        preserveUrlKeys: ['from', 'to'],
        getScene: getTab1Scene,
        tabs: [
          new SceneAppPage({
            title: 'Server names',
            url: prefixRoute(`${ROUTES.WithTabs}`),
            preserveUrlKeys: ['from', 'to'],
            getScene: getTab1Scene,
          }),
          new SceneAppPage({
            title: 'House locations',
            url: prefixRoute(`${ROUTES.WithTabs}/tab-two`),
            preserveUrlKeys: ['from', 'to'],
            getScene: getTab2Scene,
          }),
        ],
      }),
    ],
  });

export const PageWithTabs = () => {
  const s = useStyles2(getStyles);
  const scene = useMemo(() => getScene(), []);

  return (
    <div className={s.container} data-testid={testIds.pageWithTabs.container}>
      <scene.Component model={scene} />
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    display: flex;
    flex-grow: 1;
  `,
});
