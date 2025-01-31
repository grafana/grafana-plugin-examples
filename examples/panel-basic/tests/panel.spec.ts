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
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '6' });
  const options = panelEditPage.getCustomOptions('Basic Panel');
  const showSeriesCounter = options.getSwitch('Show series counter');

  await showSeriesCounter.check();
  await expect(page.getByTestId('simple-panel-series-counter')).toBeVisible();
});
