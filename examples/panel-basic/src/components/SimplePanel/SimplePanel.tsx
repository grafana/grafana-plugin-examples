import React, { useState, useEffect } from 'react';
import { PanelProps, usePluginContext } from '@grafana/data';
import { TimeSeries, TooltipPlugin, TooltipDisplayMode, ZoomPlugin, IconButton } from '@grafana/ui';
import { SimpleOptions } from '../../types';
import { testIds } from '../testIds';
import { PanelDataErrorView, UserStorage } from '@grafana/runtime';

// const storage = new UserStorage('basic-panel');

interface Props extends PanelProps<SimpleOptions> {}

export function SimplePanel({
  // Takes in a list of props used in this example
  options, // Options declared within module.ts and standard Grafana options
  data,
  width,
  height,
  timeZone,
  timeRange,
  onChangeTimeRange,
  fieldConfig,
  id,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const pluginContext = usePluginContext();
  console.log('pluginContext', pluginContext);
  let storage = pluginContext?.userStorage;

  if (!storage) {
    console.log('Creating new storage');
    storage = new UserStorage('basic-panel');
  }

  useEffect(() => {
    storage.getItem('favorite').then((value) => {
      setIsFavorite(value === 'true');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const onFavoriteClick = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    storage.setItem('favorite', newFavorite.toString());
  };

  return (
    <div data-testid={testIds.panel.container}>
      <div>
        {options.showSeriesCount && (
          <div data-testid="simple-panel-series-counter">Number of series: {data.series.length}</div>
        )}
      </div>
      <IconButton name={isFavorite ? 'favorite' : 'star'} aria-label="favorite" onClick={onFavoriteClick} />
      <TimeSeries
        width={width}
        height={height}
        timeRange={timeRange}
        timeZone={timeZone}
        frames={data.series}
        legend={options.legend}
      >
        {(config, alignedDataFrame) => {
          return (
            <>
              <TooltipPlugin
                config={config}
                data={alignedDataFrame}
                mode={TooltipDisplayMode.Multi}
                timeZone={timeZone}
              />
              <ZoomPlugin config={config} onZoom={onChangeTimeRange} />
            </>
          );
        }}
      </TimeSeries>
    </div>
  );
}
