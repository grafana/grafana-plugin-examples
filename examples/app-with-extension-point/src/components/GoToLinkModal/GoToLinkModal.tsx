import React, { ReactElement } from 'react';
import { locationUtil } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Button, Modal, VerticalGroup } from '@grafana/ui';
import { testIds } from 'components/testIds';

type Props = {
  onDismiss: () => void;
  title: string;
  path: string;
};

export function GoToLinkModal(props: Props): ReactElement {
  const { onDismiss, title, path } = props;
  const openInNewTab = () => {
    global.open(locationUtil.assureBaseUrl(path), '_blank');
    onDismiss();
  };

  const openInCurrentTab = () => locationService.push(path);

  return (
    <Modal data-testid={testIds.modal.container} title={title} isOpen onDismiss={onDismiss}>
      <VerticalGroup spacing="sm">
        <p>Do you want to proceed in the current tab or open a new tab?</p>
      </VerticalGroup>
      <Modal.ButtonRow>
        <Button onClick={onDismiss} fill="outline" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="secondary" onClick={openInNewTab} icon="external-link-alt">
          Open in new tab
        </Button>
        <Button data-testid={testIds.modal.open} type="submit" variant="primary" onClick={openInCurrentTab} icon="apps">
          Open
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
}
