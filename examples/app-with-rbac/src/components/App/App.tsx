import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { hasPermission } from '@grafana/runtime';
import { Hello, Patents, ResearchDocs } from '../../pages';
import { prefixRoute } from '../../utils/utils.routing';

export function App() {
  let routes = [<Route exact path={prefixRoute(ROUTES.Hello)} component={Hello} key="hello" />];
  if (hasPermission('grafana-appwithrbac-app.papers:read')) {
    routes.push(<Route exact path={prefixRoute(ROUTES.ResearchDocs)} component={ResearchDocs} key="documents" />);
  }
  if (hasPermission('grafana-appwithrbac-app.patents:read')) {
    routes.push(<Route exact path={prefixRoute(ROUTES.Patents)} component={Patents} key="patents" />);
  }

  return <Switch>{routes}</Switch>;
}
