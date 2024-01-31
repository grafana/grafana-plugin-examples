import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
import { Hello, Patents, ResearchDocs } from '../../pages';
import { prefixRoute } from '../../utils/utils.routing';
// @ts-ignore
import { contextSrv } from 'grafana/app/core/core';

export function App(props: AppRootProps) {
  let routes = [<Route exact path={prefixRoute(ROUTES.Hello)} component={Hello} key="hello" />];
  if (contextSrv.hasPermission('grafana-appwithrbac-app.papers:read')) {
    routes.push(<Route exact path={prefixRoute(ROUTES.ResearchDocs)} component={ResearchDocs} key="documents" />);
  }
  if (contextSrv.hasPermission('grafana-appwithrbac-app.patents:read')) {
    routes.push(<Route exact path={prefixRoute(ROUTES.Patents)} component={Patents} key="patents" />);
  }

  return (
    <Switch>
      {routes}
    </Switch>
  );
}
