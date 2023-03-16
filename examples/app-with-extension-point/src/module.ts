import pluginJson from 'plugin.json';
import { AppPlugin } from '@grafana/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    body: AppConfig,
    id: 'configuration',
  })
  .configureExtensionLink({
    title: 'testing',
    description: 'testing description',
    placement: `plugins/${pluginJson.id}/actions`,
    path: `/a/${pluginJson.id}/`,
  })
  .configureExtensionCommand({
    title: 'testing 2',
    description: 'testing description',
    placement: `plugins/${pluginJson.id}/actions`,
    handler: (context, helpers) => {
      alert('asdf asdf');
    },
  });
