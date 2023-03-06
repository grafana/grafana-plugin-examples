import { AppPlugin } from '@grafana/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';

type PanelContext = {
  title: string;
  pluginId: string;
};

type AppPluginLinkExtension = {
  title: string;
  description: string;
  path: string;
}

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    body: AppConfig,
    id: 'configuration',
  })
  //@ts-ignore
  .configureExtensionLink({
    title: 'Go to basic app',
    description: 'Will navigate the user to the basic app',
    placement: 'grafana/dashboard/panel/menu',
    path: '/a/myorg-basic-app/one',
    configure: (link: AppPluginLinkExtension, context: PanelContext): Partial<AppPluginLinkExtension> | undefined => {
      switch (context?.pluginId) {
        case 'timeseries':
          return {
            title: 'Go to page one',
            path: '/a/myorg-basic-app/one',
          };

        case 'piechart':
          return {
            title: 'Go to page two',
            path: '/a/myorg-basic-app/two',
          };
      
        default:
          return undefined;
      }
    }
  })
  //@ts-ignore
  .configureExtensionCommand({
    title: 'Ping the \'basic app\'',
    description: 'Will trigger a command handler in the basic app',
    placement: 'grafana/dashboard/panel/menu',
    handler: (context: PanelContext) => {
      console.log({context});
      alert(`Pong to '${context?.title}' from 'basic app'`);
    }
  });
