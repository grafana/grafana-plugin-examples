import { PanelProps } from '@grafana/data';
import { useTheme } from '@grafana/ui';
import * as d3 from 'd3';
import React from 'react';
import { ScatterOptions } from 'types';

interface Props extends PanelProps<ScatterOptions> {}

export const ScatterPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();

  const margin = { left: 30, top: 30, right: 30, bottom: 30 };

  const chartWidth = width - (margin.left + margin.right);
  const chartHeight = height - (margin.top + margin.bottom);

  let points: any = [];
  for (let i = 0; i < 100; i++) {
    points.push({ x: i * Math.random(), y: i * Math.random() });
  }

  const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);

  const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <g>
          {points.map((d: any, key: number) => (
            <circle key={key} cx={xScale(d.x)} cy={yScale(d.y)} r={5} fill={theme.palette.greenBase}></circle>
          ))}
        </g>
        <g
          transform={`translate(0, ${chartHeight})`}
          ref={(node) => {
            d3.select(node).call(xAxis as any);
          }}
        />
        <g
          ref={(node) => {
            d3.select(node).call(yAxis as any);
          }}
        />
      </g>
    </svg>
  );
};
