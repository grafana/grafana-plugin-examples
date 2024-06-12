import { test, expect } from '@grafana/plugin-e2e';

test('logs should show certain values', async ({ page, selectors, panelEditPage, readProvisionedDataSource }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Table');
  await panelEditPage.getQueryEditorRow('A').getByLabel('Query', { exact: true }).fill('number');
  await panelEditPage.getQueryEditorRow('A').getByLabel('Log limit', { exact: true }).fill('10');
  const refreshPanelButton = panelEditPage.getByGrafanaSelector(selectors.components.RefreshPicker.runButtonV2, {
    root: panelEditPage.getByGrafanaSelector(selectors.components.PanelEditor.General.content),
  });
  await refreshPanelButton.click();
  await expect(panelEditPage.panel.data).toContainText(['number=']);
});
