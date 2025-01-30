import { PanelEditPage, expect, test } from '@grafana/plugin-e2e';
import { testIds } from '../src/components/testIds';

test.describe('panel-datalinks panel', () => {
  let panelEditPage: PanelEditPage;

  test.beforeEach(async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  });

  test('should display "No data" when no data is passed to the panel', async ({ page }) => {
    await expect(page.getByTestId(testIds.panel.noData)).not.toBeVisible();
    await page.getByLabel('Scenario').last().click();
    await page.keyboard.insertText('No Data Points');
    await page.keyboard.press('Tab');
    await panelEditPage.refreshPanel();
    await expect(panelEditPage.panel.locator).toContainText('No data');
  });

  test('should display context menu links when clicking on circle', async ({ page }) => {
    const menu = panelEditPage.getByGrafanaSelector('Context menu');
    expect(menu).not.toBeVisible();
    await page.getByTestId(testIds.panel.svg).getByTestId(testIds.panel.circle(0)).click();
    await expect(menu.getByRole('link')).toHaveCount(2);
    await expect(menu.getByRole('link', { name: 'Visit Yahoo' })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Visit Google' })).toBeVisible();
  });

  test('should hide "Calculation" field when "All values" is enabled', async ({ page, selectors }) => {
    const valueOptions = panelEditPage.getCustomOptions('Value options');
    const showValues = valueOptions.getRadioGroup('Show');
    const calculation = valueOptions.getSelect('Calculation');

    await expect(calculation.locator()).toBeVisible();
    await showValues.check('All values');
    await expect(calculation.locator()).not.toBeVisible();
  });

  test('should display all circles when "All values" is enabled', async ({ page }) => {
    // Update query to have only one series
    await page.getByLabel('Series count', { exact: true }).fill('1');
    const seriesCount = page.locator(`[data-testid^="${testIds.panel.circle()}"]`);
    await expect(seriesCount).toHaveCount(1);

    const valueOptions = panelEditPage.getCustomOptions('Value options');
    const showValues = valueOptions.getRadioGroup('Show');

    await showValues.check('All values');
    await expect(await seriesCount.count()).toBeGreaterThan(1);
  });
});
