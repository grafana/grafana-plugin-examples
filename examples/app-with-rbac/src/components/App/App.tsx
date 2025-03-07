import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { Hello, Patents, ResearchDocs } from '../../pages';
import { prefixRoute } from '../../utils/utils.routing';
// @ts-ignore
import { contextSrv } from 'grafana/app/core/core';

export function App() {
  let routes = [<Route exact path={prefixRoute(ROUTES.Hello)} component={Hello} key="hello" />];
  if (contextSrv.hasPermission('myorg-appwithrbac-app.papers:read')) {
    routes.push(<Route exact path={prefixRoute(ROUTES.ResearchDocs)} component={ResearchDocs} key="documents" />);
  }
  if (contextSrv.hasPermission('myorg-appwithrbac-app.patents:read')) {
    routes.push(<Route exact path={prefixRoute(ROUTES.Patents)} component={Patents} key="patents" />);
  }

  return (
    <Switch>
      {routes}
    </Switch>
  );
}
