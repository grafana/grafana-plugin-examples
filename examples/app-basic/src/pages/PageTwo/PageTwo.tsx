import * as React from 'react';
import { PluginPage } from '../../components/PluginPage';
import { testIds } from '../../components/testIds';

export const PageTwo = () => (
  <PluginPage>
    <div data-testid={testIds.pageTwo.container}>This is page two.</div>
  </PluginPage>
);
