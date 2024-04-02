import { PanelEditPage, expect, test } from '@grafana/plugin-e2e';
import { testIds } from '../src/components/testIds';

test.describe('panel-datalinks panel', () => {
  let panelEditPage: PanelEditPage;
  test.beforeEach(async ({ gotoPanelEditPage }) => {
    panelEditPage = await gotoPanelEditPage({ dashboard: { uid: 'fTh-POZ4k' }, id: '2' });
  });

  test('should display context menu links when clicking on circle', async ({ page }) => {
    const menu = panelEditPage.getByTestIdOrAriaLabel('Context menu');
    expect(menu).not.toBeVisible();
    await page.getByTestId(testIds.panel.svg).getByTestId(testIds.panel.circle(0)).click();
    await expect(menu.getByRole('link')).toHaveCount(2);
    await expect(menu.getByRole('link', { name: 'Visit Yahoo' })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Visit Google' })).toBeVisible();
  });

  test('should hide "Calculation" field when "All values" is enabled', async ({ page, selectors }) => {
    panelEditPage.collapseSection('Value options');
    const calculationField = panelEditPage.getByTestIdOrAriaLabel(
      selectors.components.PanelEditor.OptionsPane.fieldLabel('Value options Calculation')
    );
    await expect(calculationField).toBeVisible();
    await page.getByText('All values', { exact: true }).click();
    await expect(calculationField).not.toBeVisible();
  });

  test('should display all circles when "All values" is enabled', async ({ page }) => {
    await page.getByLabel('Series count', { exact: true }).fill('1');
    const seriesCount = page.locator(`[data-testid^="${testIds.panel.circle()}"]`);
    await expect(seriesCount).toHaveCount(1);
    panelEditPage.collapseSection('Value options');
    await page.getByText('All values', { exact: true }).click();
    await expect(await seriesCount.count()).toBeGreaterThan(1);
  });
});
