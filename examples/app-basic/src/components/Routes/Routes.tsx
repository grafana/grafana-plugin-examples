import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useFallbackPluginNavigation } from '@grafana/migration/9.2';
import { PageOne } from '../../pages/PageOne';
import { PageTwo } from '../../pages/PageTwo';
import { PageThree } from '../../pages/PageThree';
import { PageFour } from '../../pages/PageFour';
import { prefixRoute } from '../../utils/utils.routing';
import { usePluginProps } from '../../utils/utils.plugin';
import { ROUTES } from '../../constants';

export const Routes = () => {
  const pluginProps = usePluginProps();
  useFallbackPluginNavigation(pluginProps!.onNavChanged, pluginProps!.meta, {
    excludeFromTabNav: ['Configuration', 'Page Four'],
  });

  return (
    <Switch>
      <Route exact path={prefixRoute(ROUTES.Two)} component={PageTwo} />
      <Route exact path={prefixRoute(`${ROUTES.Three}/:id?`)} component={PageThree} />

      {/* Full-width page (this page will have no navigation bar) */}
      <Route exact path={prefixRoute(ROUTES.Four)} component={PageFour} />

      {/* Default page */}
      <Route component={PageOne} />
    </Switch>
  );
};
