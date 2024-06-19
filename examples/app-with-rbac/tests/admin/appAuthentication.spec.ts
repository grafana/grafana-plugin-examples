import { test, expect } from '../fixtures';
import { ROUTES } from '../../src/constants';

test.describe('navigating app', () => {
  test('Page patents should be visible for admin', async ({ gotoPage, page }) => {
    // wait for page to successfully render
    await gotoPage(`/${ROUTES.Patents}`);
    await expect(page.getByText('Normally restricted to Administrators')).toBeVisible();
  });
  test('Page research docs should be visible for admin', async ({ gotoPage, page }) => {
    // wait for page to successfully render
    await gotoPage(`/${ROUTES.ResearchDocs}`);
    await expect(page.getByText('Normally accessible to anyone')).toBeVisible();
  });
});
