import * as React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';
import { PageOne } from '../../pages/PageOne';
import { PageTwo } from '../../pages/PageTwo';
import { PageThree } from '../../pages/PageThree';
import { PageFour } from '../../pages/PageFour';
import { useNavigation } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';

export const Routes = () => {
  useNavigation();

  return (
    // HEADS UP! We don't need a <BrowserRouter> here, as the core Grafana app already has a router.
    <ReactRoutes>
      {/* HEADS UP! We can use relative paths here now. */}
      <Route path={ROUTES.One} element={<PageOne />} />
      <Route path={ROUTES.Two} element={<PageTwo />} />
      <Route path={`${ROUTES.Three}/:id?`} element={<PageThree />} />
      <Route path={ROUTES.Four} element={<PageFour />} /> {/* Full-width page example */}
      {/* Default page */}
      <Route path="*" element={<PageOne />} />
    </ReactRoutes>
  );
};
