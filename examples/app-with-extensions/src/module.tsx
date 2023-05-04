import React from 'react';
import { AppPlugin, PluginExtensionPoints, PluginExtensionPanelContext } from '@grafana/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';
import pluginJson from 'plugin.json';
import { Modal } from 'components/Modal';

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    body: AppConfig,
    id: 'configuration',
  })
  .configureExtensionLink<PluginExtensionPanelContext>({
    title: 'Open from time series or pie charts (path)',
    description: 'This link will only be visible on time series and pie charts',
    extensionPointId: PluginExtensionPoints.DashboardPanelMenu,
    path: `/a/${pluginJson.id}/`,
    configure: (context) => {
      // Will only be visible for the Link Extensions dashboard
      if (context?.dashboard?.title !== 'Link Extensions (path)') {
        return undefined;
      }

      switch (context?.pluginId) {
        case 'timeseries':
          return {}; // Does not apply any overrides
        case 'piechart':
          return {
            title: `Open from ${context.pluginId}`,
          };

        default:
          // By returning undefined the extension will be hidden
          return undefined;
      }
    },
  })
  .configureExtensionLink<PluginExtensionPanelContext>({
    title: 'Open from time series or pie charts (onClick)',
    description: 'This link will only be visible on time series and pie charts',
    extensionPointId: PluginExtensionPoints.DashboardPanelMenu,
    onClick: (_, { openModal, context }) => {
      const targets = context?.targets;
      const title = context?.title;

      //@ts-ignore
      console.log(context.target);

      if (!Array.isArray(targets)) {
        return;
      }

      if (targets.length > 1) {
        return openModal({
          title: 'Modal opened from onClick',
          body: () => <Modal panelTitle={title} targets={targets} />,
        });
      }

      const [target] = targets;
      console.log('One query in panel', { target });
    },
    configure: (context) => {
      // Will only be visible for the Command Extensions dashboard
      if (context?.dashboard?.title !== 'Link Extensions (onClick)') {
        return undefined;
      }

      switch (context?.pluginId) {
        case 'timeseries':
          return {}; // Does not apply any overrides
        case 'piechart':
          return {
            title: `Open from ${context.pluginId}`,
          };

        default:
          // By returning undefined the extension will be hidden
          return undefined;
      }
    },
  });
