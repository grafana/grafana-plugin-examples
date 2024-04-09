import pluginJson from '../src/plugin.json';
import { test, expect } from '@grafana/plugin-e2e';

test.describe('navigating app', () => {
  test('should render home page successfully', async ({ page }) => {
    await page.goto(`/a/${pluginJson.id}`);
    await expect(page.getByText('Hello and welcome to our demo app!')).toBeVisible();
  });

  test('should be possible to navigate to example dashboard 1', async ({ page }) => {
    await page.goto(`/a/${pluginJson.id}`);
    await page.getByText('Example dashboard 1').click();
    await expect(page).toHaveURL(/\/d\/Av57mRHVz$/);
  });

  test('should be possible to navigate to example dashboard 2', async ({ page }) => {
    await page.goto(`/a/${pluginJson.id}`);
    await page.getByText('Example dashboard 2').click();
    await expect(page).toHaveURL(/\/d\/ND1Bfw3VcNGg$/);
  });
});
