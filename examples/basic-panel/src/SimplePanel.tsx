import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export function SimplePanel({ options, data, width, height }: Props) {
  console.log({ options, data, width, height });
  return <div style={{ background: 'red', width, height }}></div>;
}
