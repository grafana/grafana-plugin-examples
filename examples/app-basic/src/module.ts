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
  //@ts-ignore
  .configureExtensionLink('declare-incident', (context: any, link: any) => {
    if (context.panel.type === 'timeseries') {
      return null;
    }

    return {
      ...link,
      title: 'dynamic title',
    };
  });
