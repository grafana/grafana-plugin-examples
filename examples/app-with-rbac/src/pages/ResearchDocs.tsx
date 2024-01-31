import React from 'react';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';

export function ResearchDocs() {
   return (
    <PluginPage>
      <div data-testid={testIds.researchDocs.container}>
        This is the research docs page, normally allowed to viewers.
      </div>
    </PluginPage>
  );
}
