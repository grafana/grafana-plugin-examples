import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';

const { modal } = e2e.getSelectors(testIds);
const dashboardId = 'dbfb47c5-e5e5-4d28-8ac7-35f349b95946';

e2e.scenario({
  describeName: 'Extend "Link Extensions (onClick)"-dashboard panel menus with links',
  itName: 'Should add link extension with defaults to time series panel',
  scenario: () => {
    const panelTitle = 'Link with defaults';
    const extensionTitle = 'Open from time series...';

    e2e.flows.openDashboard({ uid: dashboardId });
    e2e.flows.openPanelMenuExtension(extensionTitle, panelTitle);

    modal.container().should('be.visible');
  },
});

e2e.scenario({
  describeName: 'Extend "Link Extensions (onClick)"-dashboard panel menus with links',
  itName: 'Should add link extension with new title to pie chart panel',
  scenario: () => {
    const panelTitle = 'Link with new name';
    const extensionTitle = 'Open from piechart';

    e2e.flows.openDashboard({ uid: dashboardId });
    e2e.flows.openPanelMenuExtension(extensionTitle, panelTitle);

    modal.container().should('be.visible');
  },
});
