import { PanelPlugin } from '@grafana/data';
import { LegendDisplayMode } from '@grafana/schema';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addRadio({
      path: 'legend.displayMode',
      name: 'Legend mode',
      category: ['Legend'],
      description: '',
      defaultValue: LegendDisplayMode.List,
      settings: {
        options: [
          { value: LegendDisplayMode.List, label: 'List' },
          { value: LegendDisplayMode.Table, label: 'Table' },
          { value: LegendDisplayMode.Hidden, label: 'Hidden' },
        ],
      },
    })
    .addRadio({
      path: 'legend.placement',
      name: 'Legend placement',
      category: ['Legend'],
      description: '',
      defaultValue: 'bottom',
      settings: {
        options: [
          { value: 'bottom', label: 'Bottom' },
          { value: 'right', label: 'Right' },
        ],
      },
      showIf: (config) => config.legend.displayMode !== LegendDisplayMode.Hidden,
    });
});
