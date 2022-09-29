import * as React from 'react';
import { PluginPage } from '@grafana/migrations/9.2';
import { testIds } from '../../components/testIds';

export const PageTwo = () => (
  <PluginPage>
    <div data-testid={testIds.pageTwo.container}>This is page two.</div>
  </PluginPage>
);
