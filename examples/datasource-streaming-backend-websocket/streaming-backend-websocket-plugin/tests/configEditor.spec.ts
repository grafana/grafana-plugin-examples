import { test, expect } from '@grafana/plugin-e2e';
import { BasicDataSourceOptions, BasicSecureJsonData } from '../src/types';

test('"Save & test" should be successful when configuration is valid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<BasicDataSourceOptions, BasicSecureJsonData>({
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
  const ds = await readProvisionedDataSource<BasicDataSourceOptions, BasicSecureJsonData>({
    fileName: 'datasources.yml',
  });
  const configPage = await createDataSourceConfigPage({ type: ds.type });
  await page.getByTestId('uri-websocket-server').fill('test.com');
  await expect(configPage.saveAndTest()).not.toBeOK();
  expect(configPage).toHaveAlert('error');
});
