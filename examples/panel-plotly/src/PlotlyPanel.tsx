import { GrafanaTheme, PanelProps } from '@grafana/data';
import { useTheme } from '@grafana/ui';
import defaults from 'lodash/defaults';
import React from 'react';
import Plot from 'react-plotly.js';
import { PlotlyOptions } from 'types';

interface Props extends PanelProps<PlotlyOptions> {}

export const PlotlyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();

  const plotlyData: Plotly.Data[] = [
    {
      x: [1, 2, 3],
      y: [2, 6, 3],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'red' },
    },
    { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] },
  ];

  const plotlyLayout: Partial<Plotly.Layout> = defaults(
    {
      width: width,
      height: height,
    },
    defaultLayout(theme)
  );

  return <Plot data={plotlyData} layout={plotlyLayout} />;
};

// defaultLayout resets the Plotly layout to work better with the Grafana theme.
const defaultLayout = (theme: GrafanaTheme) => ({
  margin: {
    r: 40,
    l: 40,
    t: 40,
    b: 40,
  },
  plot_bgcolor: 'rgba(0,0,0,0)', // Transparent
  paper_bgcolor: 'rgba(0,0,0,0)', // Transparent
  font: {
    color: theme.isDark ? theme.palette.white : theme.palette.black,
  },
});
