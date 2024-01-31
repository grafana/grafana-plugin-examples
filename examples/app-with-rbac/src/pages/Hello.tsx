import React from 'react';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';

export function Hello() {
   return (
    <PluginPage>
      <div data-testid={testIds.hello.container}>
        Welcome to the app with RBAC plugin, a fake plugin to manage your research documents and patents.
      </div>
    </PluginPage>
  );
}
