import { PanelPlugin, ReducerID, standardEditorsRegistry } from '@grafana/data';
import { PanelOptions } from './types';
import { DataLinksPanel } from './components/DataLinksPanel';

const reduceOptionsCategory = ['Value options'];

export const plugin = new PanelPlugin<PanelOptions>(DataLinksPanel).useFieldConfig().setPanelOptions((builder) => {
  builder.addRadio({
    path: 'reduceOptions.values',
    name: 'Show',
    description: 'Calculate a single value per column or series or show each row',
    settings: {
      options: [
        { value: false, label: 'Calculate' },
        { value: true, label: 'All values' },
      ],
    },
    category: reduceOptionsCategory,
    defaultValue: false,
  });

  builder.addCustomEditor({
    id: 'reduceOptions.calcs',
    path: 'reduceOptions.calcs',
    name: 'Calculation',
    category: reduceOptionsCategory,
    description: 'Choose a reducer function / calculation',
    editor: standardEditorsRegistry.get('stats-picker').editor as any,
    // TODO: Get ReducerID from generated schema one day?
    defaultValue: [ReducerID.lastNotNull],
    // Hides it when all values mode is on
    showIf: (currentConfig) => currentConfig.reduceOptions.values === false,
  });
});
