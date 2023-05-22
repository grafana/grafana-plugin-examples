import { InterpolateFunction, ReducerID, ThresholdsMode } from '@grafana/data';
import {
  SceneByFrameRepeater,
  SceneDataNode,
  SceneDataTransformer,
  SceneFlexItem,
  SceneFlexLayout,
  VizPanel,
  sceneUtils,
} from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';

export function getRoomsTemperatureTable() {
  return new VizPanel({
    pluginId: 'table',
    $data: new SceneDataTransformer({
      transformations: [
        {
          id: 'reduce',
          options: {
            reducers: ['mean'],
          },
        },
        {
          id: 'organize',
          options: {
            excludeByName: {},
            indexByName: {},
            renameByName: {
              Field: 'Room',
              Mean: 'Average temperature',
            },
          },
        },
      ],
    }),
    title: 'Room temperature overview',
    options: {
      sortBy: ['Average temperature'],
    },
    fieldConfig: {
      defaults: {
        custom: {
          align: 'auto',
          cellOptions: {
            type: 'auto',
          },
          inspect: false,
        },
        mappings: [],
        thresholds: {
          mode: ThresholdsMode.Absolute,
          steps: [
            {
              color: 'light-blue',
              value: 0,
            },
            {
              color: 'orange',
              value: 19,
            },
            {
              color: 'dark-red',
              value: 26,
            },
          ],
        },
        color: {
          mode: 'thresholds',
        },
      },
      overrides: [
        {
          matcher: {
            id: 'byName',
            options: 'Average temperature',
          },
          properties: [
            {
              id: 'unit',
              value: 'celsius',
            },
            {
              id: 'custom.cellOptions',
              value: {
                type: 'color-background',
                mode: 'basic',
              },
            },
            {
              id: 'custom.width',
              value: 200,
            },
            {
              id: 'custom.align',
              value: 'center',
            },
          ],
        },
        {
          matcher: {
            id: 'byName',
            options: 'Room',
          },
          properties: [
            {
              id: 'links',
              value: [
                {
                  title: 'Go to room overview',
                  onBuildUrl: ({ replaceVariables }: { replaceVariables: InterpolateFunction }) => {
                    return sceneUtils.getUrlWithAppState(
                      replaceVariables(prefixRoute(`${ROUTES.WithDrilldown}`) + '/room/${__value.text}/temperature')
                    );
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  });
}

export function getRoomsTemperatureStats() {
  return new SceneByFrameRepeater({
    body: new SceneFlexLayout({
      direction: 'row',
      wrap: 'wrap',
      children: [],
    }),
    getLayoutChild: (data, frame) => {
      return new SceneFlexItem({
        height: '50%',
        minWidth: '20%',
        body: new VizPanel({
          title: frame.name,
          pluginId: 'stat',

          $data: new SceneDataNode({
            data: {
              ...data,
              series: [frame],
            },
          }),
          fieldConfig: {
            defaults: {
              unit: 'celsius',
              links: [
                {
                  title: 'Go to room temperature overview',
                  url: prefixRoute(`${ROUTES.WithDrilldown}`) + '/room/${__field.name}/temperature',
                },
                {
                  title: 'Go to room humidity overview',
                  url: prefixRoute(`${ROUTES.WithDrilldown}`) + '/room/${__field.name}/humidity',
                },
              ],
            },
            overrides: [],
          },
        }),
      });
    },
  });
}

export function getRoomTemperatureStatPanel(reducers: ReducerID[]) {
  return new VizPanel({
    pluginId: 'stat',
    title: '',
    $data: new SceneDataTransformer({
      transformations: [
        {
          id: 'reduce',
          options: {
            reducers,
          },
        },
      ],
    }),
    fieldConfig: {
      defaults: {
        unit: 'celsius',
      },
      overrides: [],
    },
  });
}
