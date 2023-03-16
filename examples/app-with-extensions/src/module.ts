import { AppPlugin, PluginExtensionPlacements } from '@grafana/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';
import pluginJson from 'plugin.json';
import { PluginExtensionPanelContext } from '@grafana/runtime';
import { buildModal } from 'components/Modal';

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    body: AppConfig,
    id: 'configuration',
  })
  .configureExtensionLink<PluginExtensionPanelContext>({
    title: 'Open from time series or pie charts (link)',
    description: 'This link will only be visible on time series and pie charts',
    placement: PluginExtensionPlacements.DashboardPanelMenu,
    path: `/a/${pluginJson.id}/`,
    configure: (link, context) => {
      // Will only be visible for the Link Extensions dashboard
      if (context?.dashboard?.title !== 'Link Extensions') {
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
  .configureExtensionCommand<PluginExtensionPanelContext>({
    title: 'Open from time series or pie charts (command)',
    description: 'This command will only be visible on time series and pie charts',
    placement: PluginExtensionPlacements.DashboardPanelMenu,
    handler: (context, helper) => {
      helper?.openModal({
        title: 'Modal opened from command',
        body: buildModal(context),
      });
    },
    configure: (command, context) => {
      // Will only be visible for the Command Extensions dashboard
      if (context?.dashboard?.title !== 'Command Extensions') {
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
