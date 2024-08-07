import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { WithLLM } from 'pages/WithLLM';

export const Routes = () => {
  return (
    <Switch>
      <Route path={prefixRoute(`${ROUTES.WithLLM}`)} component={WithLLM} />
      <Redirect to={prefixRoute(ROUTES.WithLLM)} />
    </Switch>
  );
};
