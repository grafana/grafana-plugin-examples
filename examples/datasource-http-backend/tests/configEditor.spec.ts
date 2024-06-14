import { test, expect } from '@grafana/plugin-e2e';
import { MyDataSourceOptions, MySecureJsonData } from '../src/types';

test('"Save & test" should be successful when configuration is valid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  selectors,
  page,
}) => {
  const ds = await readProvisionedDataSource<MyDataSourceOptions, MySecureJsonData>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });
  await page.getByTestId('data-testid Datasource HTTP settings url').fill('http://host.docker.internal:10000/metrics');
  await expect(configPage.saveAndTest()).toBeOK();
  expect(configPage).toHaveAlert('success');
});

test('"Save & test" should fail when configuration is invalid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<MyDataSourceOptions, MySecureJsonData>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });
  await page.getByTestId('data-testid Datasource HTTP settings url').fill('http://test.com/tests');
  await expect(configPage.saveAndTest()).not.toBeOK();
  expect(configPage).toHaveAlert('error', { hasText: 'request error' });
});
