import React from 'react';
import { HorizontalGroup, LoadingPlaceholder } from '@grafana/ui';
import { ActionButton } from 'components/ActionButton';
import { usePluginExtensions } from '@grafana/runtime';
import { testIds } from 'components/testIds';

type AppExtensionContext = {};

export const App = () => {
  const extensionPointId = 'plugins/myorg-extensionpoint-app/actions';
  const context: AppExtensionContext = {};
  const { isLoading, extensions } = usePluginExtensions({
    extensionPointId,
    context,
  });

  return (
    <div data-testid={testIds.container} style={{ marginTop: '5%' }}>
      <HorizontalGroup align="flex-start" justify="center">
        <HorizontalGroup>
          <span>Hello Grafana! These are the actions you can trigger from this plugin</span>
          {isLoading ? <LoadingPlaceholder text="Loading..." /> : <ActionButton extensions={extensions} />}
        </HorizontalGroup>
      </HorizontalGroup>
    </div>
  );
};

