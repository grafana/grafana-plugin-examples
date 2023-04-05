import React from 'react';
import { AppRootProps } from '@grafana/data';
import { HorizontalGroup } from '@grafana/ui';
import { ActionButton } from 'components/ActionButton';
import { getPluginExtensions } from '@grafana/runtime';
import { testIds } from 'components/testIds';

type AppExtensionContext = {};

export class App extends React.PureComponent<AppRootProps> {
  render() {
    const extensionPointId = 'plugins/myorg-extensionpoint-app/actions';
    const context: AppExtensionContext = {};

    const { extensions } = getPluginExtensions({
      extensionPointId,
      context,
    });

    return (
      <div data-testid={testIds.container} style={{ marginTop: '5%' }}>
        <HorizontalGroup align="flex-start" justify="center">
          <HorizontalGroup>
            <span>Hello Grafana! This is the actions you can trigger from this plugin</span>
            <ActionButton extensions={extensions} />
          </HorizontalGroup>
        </HorizontalGroup>
      </div>
    );
  }
}
