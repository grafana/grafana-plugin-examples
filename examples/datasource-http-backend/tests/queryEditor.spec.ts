import { test, expect } from '@grafana/plugin-e2e';

test('data query should return a value', async ({ panelEditPage, readProvisionedDataSource }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Table');
  await panelEditPage.getQueryEditorRow('A').getByLabel('multiplier').fill('10');
  await expect(panelEditPage.refreshPanel()).toBeOK();
  await expect(panelEditPage.panel.fieldNames).toHaveText(['time', 'values']);
});
