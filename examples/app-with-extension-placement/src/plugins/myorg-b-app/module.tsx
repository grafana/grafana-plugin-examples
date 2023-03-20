import React from 'react';
import { AppPlugin } from '@grafana/data';
import { App } from './components/App';

export const plugin = new AppPlugin<{}>().setRootPage(App).configureExtensionCommand({
  title: 'Open from B',
  description: 'Open a modal from plugin B',
  placement: 'plugins/myorg-extensionplacement-app/actions',
  handler: (context, helper) => {
    helper?.openModal({
      title: 'Modal from app B',
      body: () => <div data-testid="data-testid b-app-modal">From plugin B</div>,
    });
  },
});
