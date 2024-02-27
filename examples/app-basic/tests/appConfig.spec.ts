import pluginJson from '../src/plugin.json';
import { test, expect } from '@grafana/plugin-e2e';

test('configuring app', async ({ page }) => {
  await page.goto(`/plugins/${pluginJson.id}`);

  const saveForm = page.getByRole('button', { name: /Save API settings/i });
  await expect(saveForm).toBeVisible();

  // reset the configured secret
  await page.getByRole('button', { name: /reset/i }).click();

  // enter some valid values
  await page.getByLabel('API Key').fill('secret-api-key');
  await page.getByLabel('API Url').clear();
  await page.getByLabel('API Url').fill('http://www.my-awsome-grafana-app.com/api');

  // listen for the server response on the saved form
  const saveResponse = page.waitForResponse(`/api/plugins/${pluginJson.id}/settings`);

  await saveForm.click();
  await expect(saveResponse).toBeOK();
});
