import React from 'react';
import { PanelProps } from '@grafana/data';
import { TimeSeries, TooltipPlugin, TooltipDisplayMode, ZoomPlugin } from '@grafana/ui';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export function SimplePanel({ options, data, width, height, timeZone, timeRange, onChangeTimeRange }: Props) {
  return (
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
  );
}
