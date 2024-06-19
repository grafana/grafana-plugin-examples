import { test, expect } from '../fixtures';
import { ROUTES } from '../../src/constants';

test.describe('navigating app for Viewer', () => {
  test('Page patents should not be visible for viewer', async ({ gotoPage, page }) => {
    // wait for page to successfully render
    await gotoPage(`/${ROUTES.Patents}`);
    await expect(page.getByText('Normally restricted to Administrators')).not.toBeVisible();
  });
  test('Page research docs should be visible for viewer', async ({ gotoPage, page }) => {
    // wait for page to successfully render
    await gotoPage(`/${ROUTES.ResearchDocs}`);
    await expect(page.getByText('Normally accessible to anyone')).toBeVisible();
  });
});
