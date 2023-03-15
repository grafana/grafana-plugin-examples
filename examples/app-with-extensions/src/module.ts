import { AppPlugin, PluginExtensionPlacements } from '@grafana/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';
import pluginJson from 'plugin.json';

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    body: AppConfig,
    id: 'configuration',
  })
  .configureExtensionLink({
    title: 'Go to extensions app',
    description: 'testing',
    placement: PluginExtensionPlacements.DashboardPanelMenu,
    path: `/a/${pluginJson.id}/`,
  });
