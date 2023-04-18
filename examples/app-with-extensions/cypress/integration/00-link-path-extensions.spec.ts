import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';

const { mainPage } = e2e.getSelectors(testIds);
const dashboardId = 'd1fbb077-cd44-4738-8c8a-d4e66748b719';

e2e.scenario({
  describeName: 'Extend "Link Extensions (path)"-dashboard panel menus with links',
  itName: 'Should add link extension with defaults to time series panel',
  scenario: () => {
    const panelTitle = 'Link with defaults';
    const extensionTitle = 'Open from time series...';

    e2e.flows.openDashboard({ uid: dashboardId });
    e2e.flows.openPanelMenuExtension(extensionTitle, panelTitle);

    mainPage.container().should('be.visible');
  },
});

e2e.scenario({
  describeName: 'Extend "Link Extensions (path)"-dashboard panel menus with links',
  itName: 'Should add link extension with new title to pie chart panel',
  scenario: () => {
    const panelTitle = 'Link with new name';
    const extensionTitle = 'Open from piechart';

    e2e.flows.openDashboard({ uid: dashboardId });
    e2e.flows.openPanelMenuExtension(extensionTitle, panelTitle);

    mainPage.container().should('be.visible');
  },
});
