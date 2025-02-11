import { AppPlugin } from '@grafana/data';
import { App } from './components/App';

export const plugin = new AppPlugin<{}>().setRootPage(App).addLink({
  title: 'Go to A',
  description: 'Navigating to pluging A',
  targets: ['plugins/myorg-extensionpoint-app/actions'],
  path: '/a/myorg-a-app/',
});
