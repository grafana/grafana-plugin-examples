import { test, expect } from './fixtures';

test('configuring app', async ({ appConfigPage, page }) => {
  const saveForm = page.getByRole('button', { name: /Save API settings/i });

  // reset the configured secret
  await page.getByRole('button', { name: /reset/i }).click();

  // enter some valid values
  await page.getByRole('textbox', { name: 'API Key' }).fill('secret-api-key');
  await page.getByRole('textbox', { name: 'API Url' }).clear();
  await page.getByRole('textbox', { name: 'API Url' }).fill('http://www.my-awsome-grafana-app.com/api');

  // listen for the server response on the saved form
  const saveResponse = appConfigPage.waitForSettingsResponse();

  await saveForm.click();
  await expect(saveResponse).toBeOK();
});
