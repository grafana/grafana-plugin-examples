import { test, expect } from '@grafana/plugin-e2e';
import { MyDataSourceOptions } from '../src/types';

test('Provisioned data source with valid credentials should return a 200 status code', async ({
  readProvisionedDataSource,
  gotoDataSourceConfigPage,
}) => {
  const datasource = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  const configPage = await gotoDataSourceConfigPage(datasource.uid);
  await expect(configPage.saveAndTest()).toBeOK();
});

test('"Save & test" should be successful when configuration is valid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<MyDataSourceOptions>({
    fileName: 'datasources.yml',
  });
  const configPage = await createDataSourceConfigPage({ type: ds.type });
  await page.getByTestId('uri-websocket-server').fill('ws://host.docker.internal:8080');
  await expect(configPage.saveAndTest()).toBeOK();
  expect(configPage).toHaveAlert('success');
});

test('"Save & test" should fail when configuration is invalid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<MyDataSourceOptions>({
    fileName: 'datasources.yml',
  });
  const configPage = await createDataSourceConfigPage({ type: ds.type });
  await page.getByTestId('uri-websocket-server').fill('test.com');
  await expect(configPage.saveAndTest()).not.toBeOK();
  expect(configPage).toHaveAlert('error');
});
