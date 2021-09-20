import { DataFrameView, FieldType, PanelProps } from '@grafana/data';
import { scaleLinear, scaleTime } from '@vx/scale';
import { AreaClosed } from '@vx/shape';
import React from 'react';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

interface DataPoint {
  Time: number;
  Value: number;
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const { from, to } = data.timeRange;

  const frame = data.series[0];
  const valueField = frame.fields.find((f) => f.type === FieldType.number);

  const view = new DataFrameView<DataPoint>(frame).toArray();

  const getDate = (d: DataPoint) => new Date(d.Time);
  const getValue = (d: DataPoint) => d.Value;

  const dateScale = scaleTime({
    range: [0, width],
    domain: [from.toDate(), to.toDate()],
  });

  const valueScale = scaleLinear({
    range: [height, 0],
    domain: [valueField?.config.min || 0, valueField?.config.max || 0],
    nice: true,
  });

  return (
    <div style={{ width, height }}>
      <svg width={width} height={height}>
        <AreaClosed
          data={view}
          x={(d) => dateScale(getDate(d)) || 0}
          y={(d) => valueScale(getValue(d)) || 0}
          yScale={valueScale}
          fill={'red'}
        />
      </svg>
    </div>
  );
};
