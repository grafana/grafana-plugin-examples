import React from 'react';
import * as d3 from 'd3';

interface YAxisProps {
  height: number;
  extents: [number, number];
}

export const YAxis: React.FC<YAxisProps> = ({ height, extents }) => {
  const scale = d3
    .scaleLinear()
    .domain(extents)
    .range([height, 0]);

  const axis = d3.axisLeft(scale) as any;

  return (
    <>
      <g
        ref={node => {
          d3.select(node).call(axis);
        }}
      />
    </>
  );
};
