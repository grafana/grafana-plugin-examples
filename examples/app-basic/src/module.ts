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
  .configureExtensionLink('declare-incident', (link: any, panel: any) => {
    console.log(link, panel);
    if (panel.type === 'timeseries') {
      return null;
    }

    return {
      ...link,
      title: `Let's go ${panel.type} 🚀`,
      path: `${link.path}/${panel.type}`,
    };
  });
