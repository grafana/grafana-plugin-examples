import { test, expect } from './fixtures';

test.describe('navigating app', () => {
  test('should render home page successfully', async ({ gotoPage, page }) => {
    await gotoPage('/');
    await expect(page.getByText('Hello and welcome to our demo app!')).toBeVisible();
  });

  test('should be possible to navigate to example dashboard 1', async ({ gotoPage, page }) => {
    await gotoPage('/');
    await page.getByText('Example dashboard 1').click();
    await expect(page).toHaveURL(/\/d\/Av57mRHVz\//);
  });

  test('should be possible to navigate to example dashboard 2', async ({ gotoPage, page }) => {
    await gotoPage('/');
    await page.getByText('Example dashboard 2').click();
    await expect(page).toHaveURL(/\/d\/ND1Bfw3VcNGg\//);
  });
});
