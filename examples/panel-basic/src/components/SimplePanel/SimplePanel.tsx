import React, { useState, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { TimeSeries, TooltipPlugin, TooltipDisplayMode, ZoomPlugin, IconButton } from '@grafana/ui';
import { SimpleOptions } from '../../types';
import { testIds } from '../testIds';
import { PanelDataErrorView, getItem, setItem } from '@grafana/runtime';

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

  useEffect(() => {
    getItem(`basic-panel.favorite`).then((value) => {
      console.log('got value from storage', value);
      setIsFavorite(value === 'true');
    });
  }, []);

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const onFavoriteClick = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    setItem(`basic-panel.favorite`, newFavorite.toString());
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
