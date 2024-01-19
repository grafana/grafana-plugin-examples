import React from 'react';
import { PanelProps } from '@grafana/data';
import { TimeSeries, TooltipPlugin, TooltipDisplayMode, ZoomPlugin } from '@grafana/ui';
import { SimpleOptions } from '../../types';
import { testIds } from '../testIds';

interface Props extends PanelProps<SimpleOptions> {} 

export function SimplePanel({ // Takes in a list of props used in this example
  options, // Options declared within module.ts and standard Grafana options
  data,
  width,
  height,
  timeZone,
  timeRange,
  onChangeTimeRange,
  replaceVariables,
}: Props) {
  console.log('Panel rendered. ✔️');

  return (
    <div data-testid={testIds.panel.container}>
      <div> 
        <strong>Variable: </strong> 
        {replaceVariables('"$myVariable"')} {/** Replaces any defined variable in dashboard with value of variable */}
              </div>
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
