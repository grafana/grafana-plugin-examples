import React from 'react';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';

export function Patents() {
   return (
    <PluginPage>
      <div data-testid={testIds.patents.container}>
        This is the patents page, normally restricted to admins.
      </div>
    </PluginPage>
  );
}
