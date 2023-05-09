import React from 'react';
import { AppPlugin } from '@grafana/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';
import { CustomDSConfig, JsonData } from './components/CustomDSConfig';

type PanelContext = {
  title: string;
  pluginId: string;
};

type DataSourceSettingsContext = {
  pluginId: string;
  jsonData: Record<string, unknown>;
  onUpdateJsonData: (jsonData: JsonData) => void;
};

type PluginExtensionLink = {
  title: string;
  description: string;
  path: string;
};

type PluginExtensionElement = {
  title: string;
  description: string;
  element: React.ReactNode;
};

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
    extensionPointId: 'grafana/dashboard/panel/menu',
    path: '/a/myorg-basic-app/one',
    configure: (context: PanelContext): Partial<PluginExtensionLink> | undefined => {
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
    },
  })
  .configureExtensionElement({
    title: 'Custom DS Config',
    description: 'This will extend every datasource configuration',
    extensionPointId: 'grafana/datasources/config',
    element: <CustomDSConfig jsonData={{}} onUpdateJsonData={() => {}} />,
    configure: (context?: DataSourceSettingsContext): Partial<PluginExtensionElement> | undefined => {
      if (context?.pluginId?.includes('prometheus')) {
        console.log('APP_BASIC: This is a Prometheus datasource.');
      }

      return {
        element: <CustomDSConfig jsonData={context?.jsonData || {}} onUpdateJsonData={context?.onUpdateJsonData} />,
      };
    },
  });

//@ts-ignore
// .configureExtensionCommand({
//   title: 'Ping the "Basic App"',
//   description: 'Will trigger a command handler in the basic app',
//   placement: 'grafana/dashboard/panel/menu',
//   handler: (context: PanelContext, helpers: any): void => {
//     console.log('COMMAND HANDLER', { helpers, context });
//     helpers.openModal({ title: 'My super cool modal', body: SampleModal });
//   },
// });
