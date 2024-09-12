import { test, expect } from '@grafana/plugin-e2e';
import { testIds } from '../src/components/testIds';

const panelTitle = 'Link with defaults';
const extensionTitle = 'Open from time series...';
test('should add link extension (path) with defaults to time series panel', async ({
  gotoDashboardPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'link-path-extensions.json' });
  const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
  const panel = await dashboardPage.getPanelByTitle(panelTitle);
  await panel.clickOnMenuItem(extensionTitle, { parentItem: 'Extensions' });
  await expect(page.getByTestId(testIds.mainPage.container)).toBeVisible();
});

test('should add link extension (onclick) with defaults to time series panel', async ({
  gotoDashboardPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'link-onclick-extensions.json' });
  const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
  const panel = await dashboardPage.getPanelByTitle(panelTitle);
  await panel.clickOnMenuItem(extensionTitle, { parentItem: 'Extensions' });
  await expect(page.getByRole('dialog')).toContainText('Select query from "Link with defaults"');
});

test('should add link extension (onclick) with new title to pie chart panel', async ({
  gotoDashboardPage,
  readProvisionedDashboard,
  page,
}) => {
  const panelTitle = 'Link with new name';
  const extensionTitle = 'Open from piechart';
  const dashboard = await readProvisionedDashboard({ fileName: 'link-onclick-extensions.json' });
  const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
  const panel = await dashboardPage.getPanelByTitle(panelTitle);
  await panel.clickOnMenuItem(extensionTitle, { parentItem: 'Extensions' });
  await expect(page.getByRole('dialog')).toContainText('Select query from "Link with new name"');
});
