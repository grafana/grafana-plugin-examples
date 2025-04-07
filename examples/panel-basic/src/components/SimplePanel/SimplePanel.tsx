import React from 'react';
import { PanelProps } from '@grafana/data';
import { PanelDataErrorView } from '@grafana/runtime';
import { Table } from '@grafana/ui';

import { SimpleOptions } from '../../types';
import { testIds } from '../testIds';

interface Props extends PanelProps<SimpleOptions> {}

export function SimplePanel({
  // Takes in a list of props used in this example
  options, // Options declared within module.ts and standard Grafana options
  data,
  fieldConfig,
  id,
  width,
  height,
  timeRange,
}: Props) {
  if (!data.series.length) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
    <div data-testid={testIds.panel.container}>
      <div>
        {options.showSeriesCount && (
          <div data-testid="simple-panel-series-counter">Number of series: {data.series.length}</div>
        )}

        <Table data={data.series[0]} width={width} height={height} timeRange={timeRange}></Table>
      </div>
    </div>
  );
}
