import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { PageOne } from 'pages/PageOne';
import { PageTwo } from 'pages/PageTwo';
import { PageThree } from 'pages/PageThree';
import { PageFour } from 'pages/PageFour';
import { useNavigation } from 'utils/utils.routing';
import { PLUGIN_BASE_URL, ROUTES } from '../../constants';

export const Routes = () => {
  useNavigation();

  return (
    <Switch>
      <Route exact path={`${PLUGIN_BASE_URL}/${ROUTES.One}`} component={PageOne} />
      <Route exact path={`${PLUGIN_BASE_URL}/${ROUTES.Two}`} component={PageTwo} />
      <Route exact path={`${PLUGIN_BASE_URL}/${ROUTES.Three}/:id?`} component={PageThree} />

      {/* Full-width page (this page will have no navigation bar) */}
      <Route exact path={`${PLUGIN_BASE_URL}/${ROUTES.Four}`} component={PageFour} />

      {/* Default page */}
      <Route exact path="*">
        <Redirect to={`${PLUGIN_BASE_URL}/${ROUTES.One}`} />
      </Route>
    </Switch>
  );
};
