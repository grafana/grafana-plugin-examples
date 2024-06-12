import { test, expect } from '@grafana/plugin-e2e';

test('table query should return three columns', async ({
  page,
  selectors,
  panelEditPage,
  readProvisionedDataSource,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Table');
  await panelEditPage
    .getByGrafanaSelector(selectors.components.CodeEditor.container)
    .getByRole('textbox')
    .fill('SELECT * FROM $table WHERE $__timeFilter(created)');
  await expect(panelEditPage.refreshPanel()).toBeOK();
  await page.getByRole('combobox', { name: 'Query type' }).click();
  await panelEditPage.getByGrafanaSelector(selectors.components.Select.option).getByText('Table').click();
  await expect(panelEditPage.panel.fieldNames).toHaveText(['time', 'temperature outside', 'temperature inside']);
});

test('time series query should return certain values', async ({
  page,
  selectors,
  panelEditPage,
  readProvisionedDataSource,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  const { CodeEditor, Select } = selectors.components;
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Table');
  await panelEditPage
    .getByGrafanaSelector(CodeEditor.container)
    .getByRole('textbox')
    .fill('SELECT * FROM $table WHERE $__timeFilter(created)');
  await expect(panelEditPage.refreshPanel()).toBeOK();
  await page.getByRole('combobox', { name: 'Query type' }).click();
  await panelEditPage.getByGrafanaSelector(Select.option).getByText('TimeSeries').click();
  await expect(panelEditPage.panel.data).toContainText([/.*/, '25', /.*/, '22', /.*/, '19']);
});
