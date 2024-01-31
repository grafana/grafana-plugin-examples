import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
import { PageFour, PageOne, PageThree, PageTwo } from '../../pages';
import { prefixRoute } from '../../utils/utils.routing';

export function App(props: AppRootProps) {
  return (
    <Switch>
      <Route exact path={prefixRoute(ROUTES.Two)} component={PageTwo} />
      <Route exact path={prefixRoute(`${ROUTES.Three}/:id?`)} component={PageThree} />

      {/* Full-width page (this page will have no side navigation) */}
      <Route exact path={prefixRoute(ROUTES.Four)} component={PageFour} />

      {/* Default page */}
      <Route component={PageOne} />
    </Switch>
  );
}
