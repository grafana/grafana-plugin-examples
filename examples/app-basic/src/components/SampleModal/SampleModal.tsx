import * as React from 'react';
import { VerticalGroup } from '@grafana/ui';

export type Props = {
  onDismiss: () => void;
};

export const SampleModal = ({ onDismiss }: Props) => {
  return (
    <VerticalGroup spacing="sm">
      <p>THE MACHINE WORKS!!!</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam bibendum lobortis porta.</p>
      <p>
        Aliquam venenatis dignissim felis ac facilisis. Mauris eu dui nec sem lacinia placerat. Duis fringilla purus
        nisi, vel varius sem ultrices ut.
      </p>
    </VerticalGroup>
  );
};
