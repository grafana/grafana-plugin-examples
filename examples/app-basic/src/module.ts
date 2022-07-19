import { AppPlugin } from '@grafana/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';

export const plugin = new AppPlugin<{}>().setRootPage(App).addConfigPage({
  title: 'Configuration',
  icon: 'fa fa-cog',
  // @ts-ignore - Would expect a Class component, however works absolutely fine with a functional one
  // Implementation: https://github.com/grafana/grafana/blob/fd44c01675e54973370969dfb9e78f173aff7910/public/app/features/plugins/PluginPage.tsx#L157
  body: AppConfig,
  id: 'configuration',
});
