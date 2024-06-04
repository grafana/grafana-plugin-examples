import { test, expect } from './fixtures';
import { ROUTES } from '../src/constants';

test.describe('navigating app', () => {
  test('Page patents should be visible for admin', async ({ gotoPage, page }) => {
    // wait for page to successfully render
    await gotoPage('/hello');
    await expect(page).toHaveURL(/.*patents/);
    await expect(page.getByText('Welcome')).toBeVisible();
  });
  test('Page research docs should be visible for admin', async ({ gotoPage, page }) => {
    // wait for page to successfully render
    await gotoPage(`/${ROUTES.ResearchDocs}`);
    await expect(page).toHaveURL(/.*research/);
    await expect(page.getByText('Welcome')).toBeVisible();
  });
});
