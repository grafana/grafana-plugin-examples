import * as semver from 'semver';
import { test, expect } from '@grafana/plugin-e2e';

test('should display "No data" in case panel data is empty', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  await expect(panelEditPage.panel.locator).toContainText('No data');
});

test('should display series counter when "Show series counter" option is enabled', async ({
  panelEditPage,
  readProvisionedDataSource,
  page,
  selectors,
  grafanaVersion,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml', name: 'TestData DB' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Basic Panel');
  await panelEditPage.collapseSection('Basic Panel');
  await panelEditPage.refreshPanel();
  await expect(page.getByTestId('simple-panel-series-counter')).not.toBeVisible();
  const seriesCounterLabel = panelEditPage.getByGrafanaSelector(
    selectors.components.PanelEditor.OptionsPane.fieldLabel('Basic Panel Show series counter')
  );
  const switchField = semver.gte(grafanaVersion, '11.4.0')
    ? seriesCounterLabel.getByRole('switch')
    : seriesCounterLabel.getByLabel('Toggle switch');
  await switchField.click({ force: true });
  await expect(page.getByTestId('simple-panel-series-counter')).toBeVisible();
});
