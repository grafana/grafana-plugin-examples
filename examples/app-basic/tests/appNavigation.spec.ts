import pluginJson from '../src/plugin.json';
import { test, expect } from './fixtures';

test.describe('navigating app', () => {
  test('page one should render successfully', async ({ gotoPage, page }) => {
    await gotoPage('/one');
    await expect(page.getByText('This is page one.')).toBeVisible();
  });

  test('page two should render successfully', async ({ gotoPage, page }) => {
    await gotoPage('/two');
    await expect(page.getByText('This is page two.')).toBeVisible();
  });

  test('page two should support an id parameter', async ({ gotoPage, page }) => {
    await gotoPage('/two/123456');
    await expect(page.getByText('ID: 123456')).toBeVisible();
  });

  test('page three should render sucessfully', async ({ gotoPage, page }) => {
    // wait for page to successfully render
    await gotoPage('/one');
    await expect(page.getByText('This is page one.')).toBeVisible();

    // navigating to page four with full width layout without sidebar menu
    await page.getByText('Full-width page example').click();

    // navigate back to page one and verify tat sidebar menu is back
    await page.getByText('Back').click();
  });
});
