import React from 'react';
import { PanelProps } from '@grafana/data';
import { PlotlyOptions } from 'types';
import Plot from 'react-plotly.js';

interface Props extends PanelProps<PlotlyOptions> {}

export const PlotlyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  return (
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [2, 6, 3],
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: 'red' },
        },
        { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] },
      ]}
      layout={{ width: width, height: height, title: 'A Fancy Plot' }}
    />
  );
};
