import React from 'react';
import { AppPlugin } from '@grafana/data';
import { App } from './components/App';
import { testIds } from 'components/testIds';

export const plugin = new AppPlugin<{}>().setRootPage(App).addLink({
  title: 'Open from B',
  description: 'Open a modal from plugin B',
  targets: ['plugins/myorg-extensionpoint-app/actions'],
  onClick: (_, { openModal }) => {
    openModal({
      title: 'Modal from app B',
      body: () => <div data-testid={testIds.appB.modal}>From plugin B</div>,
    });
  },
});
