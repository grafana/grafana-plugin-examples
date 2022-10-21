import * as React from 'react';
import { AppRootProps } from '@grafana/data';

export class App extends React.PureComponent<AppRootProps> {
  render() {
    return (
      <>
        <div className="page-container">
          <h1>Hello and welcome to our demo app!</h1>
          <h2>Check out our dashboards:</h2>
          <br />
          <ul>
            <li>
              <a href="/d/Av57mRHVz">Example dashboard 1</a>
            </li>
            <li>
              <a href="/d/ND1Bfw3VcNGg">Example dashboard 2</a>
            </li>
          </ul>
        </div>
      </>
    );
  }
}
