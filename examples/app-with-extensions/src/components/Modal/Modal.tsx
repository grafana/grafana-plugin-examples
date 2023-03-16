import { PluginExtensionPanelContext } from '@grafana/runtime';
import { testIds } from 'components/testIds';
import React, { ElementType, ReactElement } from 'react';

type ModalElementType = ElementType<{ onDismiss?: () => void | undefined }>;

export function buildModal(context: PluginExtensionPanelContext | undefined): ModalElementType {
  return function ModalWithAccessToContext() {
    return <ModalBody panelTitle={context?.title} />;
  };
}

type Props = {
  panelTitle: string | undefined;
};

export function ModalBody(props: Props): ReactElement {
  const { panelTitle } = props;
  return <div data-testid={testIds.modal.container}>Modal opened from panel: {panelTitle}</div>;
}
