import { PanelPlugin, FieldColorModeId } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel)
  .useFieldConfig({
    standardOptions: {
      color: {
        defaultValue: {
          mode: FieldColorModeId.ContinuousGrYlRd,
        },
      },
    },
  })
  .setPanelOptions((builder) => {
    return builder
      .addBooleanSwitch({
        path: 'showSeriesCount',
        name: 'Show series counter',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'showTableHeader',
        name: 'Show table header',
        defaultValue: true,
      });
  });
