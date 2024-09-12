import { test, expect } from '@grafana/plugin-e2e';

test('should expand $table variable before calling backend', async ({
  gotoDashboardPage,
  readProvisionedDashboard,
  selectors,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const dashboardPage = await gotoDashboardPage(dashboard);
  const panelEditPage = await dashboardPage.addPanel();
  const queryDataSpy = panelEditPage.waitForQueryDataRequest((request) =>
    (request.postData() ?? '').includes('select * from temperature_metrics')
  );
  await panelEditPage
    .getByGrafanaSelector(selectors.components.CodeEditor.container)
    .getByRole('textbox')
    .fill('select * from $table');
  await panelEditPage.refreshPanel();
  await expect(await queryDataSpy).toBeTruthy();
});
