import React from 'react';
import pluginJson from 'plugin.json';
import { AppRootProps } from '@grafana/data';
import { HorizontalGroup } from '@grafana/ui';
import { ExtensionsButton } from 'components/ExtensionsButton';
import { getPluginExtensions } from '@grafana/runtime';

type AppExtensionContext = {};

export class App extends React.PureComponent<AppRootProps> {
  render() {
    const placement = `plugins/${pluginJson.id}/actions`;
    const context: AppExtensionContext = {};

    const { extensions } = getPluginExtensions({
      placement,
      context,
    });

    return (
      <div className="page-container" style={{ marginTop: '5%' }}>
        <HorizontalGroup>
          <span>Hello Grafana! This is the actions you can trigger from this plugin</span>
        </HorizontalGroup>
        <HorizontalGroup>
          <ExtensionsButton extensions={extensions} />
        </HorizontalGroup>
      </div>
    );
  }
}
