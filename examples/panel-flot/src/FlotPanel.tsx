import React, { useRef, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { FlotOptions } from 'types';

import $ from 'jquery';

interface Props extends PanelProps<FlotOptions> {}

export const FlotPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;

    ($ as any).plot(
      canvas,
      [
        [
          [0, 0],
          [1, 1],
        ],
      ],
      { yaxis: { max: 1 } }
    );
  });

  return <div ref={ref} style={{ width: width, height: height }} />;
};
