import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { PageOne } from '../../pages/PageOne';
import { PageTwo } from '../../pages/PageTwo';
import { PageThree } from '../../pages/PageThree';
import { PageFour } from '../../pages/PageFour';
import { useNavigation, prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';

export const Routes = () => {
  useNavigation();

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
