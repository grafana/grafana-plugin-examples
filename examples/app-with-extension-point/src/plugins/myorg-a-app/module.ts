import { AppPlugin } from '@grafana/data';
import { App } from './components/App';

export const plugin = new AppPlugin<{}>().setRootPage(App).configureExtensionLink({
  title: 'Go to A',
  description: 'Navigating to pluging A',
  extensionPointId: 'plugins/myorg-extensionpoint-app/actions',
  path: '/a/myorg-a-app/',
});
