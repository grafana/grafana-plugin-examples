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
      layout={{
        margin: {
          r: 40,
          l: 40,
          t: 40,
          b: 40,
        },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: {
          color: '#ffffff',
        },
        width: width,
        height: height,
      }}
    />
  );
};
