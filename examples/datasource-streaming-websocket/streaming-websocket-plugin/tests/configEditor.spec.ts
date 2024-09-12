import { test, expect } from '@grafana/plugin-e2e';
import { BasicDataSourceOptions, BasicSecureJsonData } from '../src/types';

test('"Save & test" should be successful when configuration is valid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  selectors,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });

  await configPage.getByGrafanaSelector(selectors.pages.DataSource.saveAndTest).click();
  await expect(configPage).toHaveAlert('success');
});
