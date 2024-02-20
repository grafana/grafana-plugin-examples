import * as React from 'react';
import { AppRootProps } from '@grafana/data';
import { Route, Routes } from 'react-router-dom';
import { PluginPropsContext } from '../../utils/utils.plugin';
import { PageOne } from '../../pages/PageOne';
import { PageTwo } from '../../pages/PageTwo';
import { PageThree } from '../../pages/PageThree';
import { PageFour } from '../../pages/PageFour';
import { ROUTES } from '../../constants';

export class App extends React.PureComponent<AppRootProps> {
  render() {
    return (
      <PluginPropsContext.Provider value={this.props}>
        <Routes>
          <Route path={ROUTES.Two} element={<PageTwo />} />
          <Route path={`${ROUTES.Three}/:id?`} element={<PageThree />} />

          {/* Full-width page (this page will have no navigation bar) */}
          <Route path={ROUTES.Four} element={<PageFour />} />

          {/* Default page */}
          <Route path="*" element={<PageOne />} />
        </Routes>
      </PluginPropsContext.Provider>
    );
  }
}
