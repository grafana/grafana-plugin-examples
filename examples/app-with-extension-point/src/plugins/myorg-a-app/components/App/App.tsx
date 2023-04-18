import * as React from 'react';
import { AppRootProps } from '@grafana/data';

export class App extends React.PureComponent<AppRootProps> {
  render() {
    return (
      <div data-testid="data-testid a-app-body" className="page-container">
        Hello Grafana!
      </div>
    );
  }
}
