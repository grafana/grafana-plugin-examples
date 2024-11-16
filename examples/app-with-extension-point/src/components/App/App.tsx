import React from 'react';
import { HorizontalGroup } from '@grafana/ui';
import { ActionButton } from 'components/ActionButton';
import { usePluginLinks } from '@grafana/runtime';
import { testIds } from 'components/testIds';

export const App = () => {
  const extensionPointId = 'plugins/myorg-extensionpoint-app/actions';
  const { links } = usePluginLinks({ extensionPointId });

  return (
    <div data-testid={testIds.container} style={{ marginTop: '5%' }}>
      <HorizontalGroup align="flex-start" justify="center">
        <HorizontalGroup>
          <span>Hello Grafana! These are the actions you can trigger from this plugin</span>
          <ActionButton links={links} />
        </HorizontalGroup>
      </HorizontalGroup>
    </div>
  );
};
