import * as semver from 'semver';
import { test, expect } from '@grafana/plugin-e2e';

test('data query should return a value', async ({ panelEditPage, readProvisionedDataSource, grafanaVersion }) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Table');
  await panelEditPage.getQueryEditorRow('A').getByRole('textbox', { name: 'Query Text' }).fill('test query');
  await panelEditPage.getQueryEditorRow('A').getByRole('spinbutton').fill('10');
  await expect(panelEditPage.panel.fieldNames).toContainText(['Time', 'Value']);
  await expect(panelEditPage.panel.data).toContainText(['10']);
  if (semver.gte(grafanaVersion, '11.5.0')) {
    await expect(panelEditPage).toHaveAlert('error', { hasText: 'Path is required' });
  }
});
