import { DataQuery } from '@grafana/data';
import { testIds } from 'components/testIds';
import React, { ReactElement } from 'react';

type Props = {
  panelTitle: string | undefined;
  targets: DataQuery[] | undefined;
};

export function Modal(props: Props): ReactElement {
  const { panelTitle } = props;
  return <div data-testid={testIds.modal.container}>Modal opened from panel: {panelTitle}</div>;
}
