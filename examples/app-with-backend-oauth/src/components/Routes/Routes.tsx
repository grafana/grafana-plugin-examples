import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { PageOne } from '../../pages/PageOne';
import { AppConfig } from '../AppConfig';
import { useNavigation, prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';

export const Routes = () => {
  useNavigation();

  return (
    <Switch>
      <Route exact path={prefixRoute(`${ROUTES.Config}`)} component={AppConfig} />
      {/* Default page */}
      <Route component={PageOne} />
    </Switch>
  );
};
