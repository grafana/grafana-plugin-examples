import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { PageOne } from '../../pages';

export function App(props: AppRootProps) {
  return (
    <Switch>
      {/* Default page */}
      <Route component={PageOne} />
    </Switch>
  );
}
