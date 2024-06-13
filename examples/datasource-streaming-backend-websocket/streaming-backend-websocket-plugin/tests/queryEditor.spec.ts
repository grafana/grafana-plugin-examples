import { test, expect } from '@grafana/plugin-e2e';

test('table query should show streaming data', async ({ panelEditPage, readProvisionedDataSource }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Table');
  await panelEditPage.getQueryEditorRow('A').getByTestId('lower-limit').fill('1');
  await panelEditPage.getQueryEditorRow('A').getByTestId('upper-limit').fill('10');
  await expect(panelEditPage.panel.fieldNames).toContainText(['time', 'value']);
});
