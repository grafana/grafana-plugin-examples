import { test, expect } from './fixtures';
import { ROUTES } from '../src/constants';

test.describe('app requests', () => {
  test('GET request should be successfully', async ({ gotoPage, page }) => {
    await gotoPage(`/${ROUTES.One}`);
    await expect(page.getByTestId('data-testid pg-one-health')).toBeVisible();
    await page.getByRole('button', { name: 'Request' }).click();
    await expect(page.getByTestId('json-format-response')).toContainText('New dashboard');
  });
});
