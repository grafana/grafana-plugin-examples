import React from 'react';
import * as d3 from 'd3';

interface XAxisProps {
  width: number;
  extents: [number, number];
}

export const XAxis: React.FC<XAxisProps> = ({ width, extents }) => {
  const scale = d3
    .scaleLinear()
    .domain(extents)
    .range([0, width]);

  const axis = d3.axisBottom(scale) as any;
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
