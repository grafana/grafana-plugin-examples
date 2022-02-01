import React from 'react';
import { PanelProps } from '@grafana/data';
import { TimeSeries } from '@grafana/ui';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export function SimplePanel({ options, data, width, height, timeRange, timeZone }: Props) {
  return (
    <TimeSeries
      width={width}
      height={height}
      timeRange={timeRange}
      timeZone={timeZone}
      frames={data.series}
      legend={options.legend}
    />
  );
}
