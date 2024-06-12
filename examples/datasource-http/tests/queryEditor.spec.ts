import { test, expect } from '@grafana/plugin-e2e';

test('data query should return a value', async ({ panelEditPage, readProvisionedDataSource }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Table');
  await panelEditPage.getQueryEditorRow('A').getByRole('textbox', { name: 'Query Text' }).fill('number=1056');
  await panelEditPage.getQueryEditorRow('A').getByRole('spinbutton').fill('10');
  await expect(panelEditPage.panel.fieldNames).toContainText(['number=1056']);
});
