import semver from 'semver';
import { initPluginTranslations, t } from '@grafana/i18n';

import { config } from '@grafana/runtime';
import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';
import pluginJson from 'plugin.json';
import { loadResources } from 'loadResources';

// Before Grafana version 12.1.0 the plugin is responsible for loading translation resources
// In Grafana version 12.1.0 and later Grafana is responsible for loading translation resources
const loaders = semver.lt(config?.buildInfo?.version, '12.1.0') ? [loadResources] : [];
await initPluginTranslations(pluginJson.id, loaders);

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'text',
      name: t('panel.options.text.name', 'Simple text option'),
      description: t('panel.options.text.description', 'Description of panel option'),
      defaultValue: t('panel.options.text.defaultValue', 'Default value of text input option'),
    })
    .addBooleanSwitch({
      path: 'showSeriesCount',
      name: t('panel.options.showSeriesCount.name', 'Show series counter'),
      defaultValue: false,
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',

      name: t('panel.options.seriesCountSize.name', 'Series counter size'),
      settings: {
        options: [
          {
            value: 'sm',
            label: t('panel.options.seriesCountSize.options.sm', 'Small'),
          },
          {
            value: 'md',
            label: t('panel.options.seriesCountSize.options.md', 'Medium'),
          },
          {
            value: 'lg',
            label: t('panel.options.seriesCountSize.options.lg', 'Large'),
          },
        ],
      },
      showIf: (config) => config.showSeriesCount,
    });
});
