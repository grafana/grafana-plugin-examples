import * as semver from 'semver';
import { PanelEditPage, expect, test } from '@grafana/plugin-e2e';
import { testIds } from '../src/components/testIds';
import { Locator } from '@playwright/test';

test.describe('panel-datalinks panel', () => {
  let panelEditPage: PanelEditPage;
  let getByText: (text: string) => Locator;

  test.beforeEach(async ({ gotoPanelEditPage, grafanaVersion, page }) => {
    panelEditPage = await gotoPanelEditPage({ dashboard: { uid: 'fTh-POZ4k' }, id: '2' });

    // seems label association was introduced in 10.2.3 - https://github.com/grafana/grafana/pull/78010
    getByText = (text: string) => {
      return semver.gte(grafanaVersion, '10.2.3')
        ? page.getByLabel(text, { exact: true })
        : page.getByText(text, { exact: true });
    };
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
    panelEditPage.collapseSection('Value options');
    const calculationField = panelEditPage.getByGrafanaSelector(
      selectors.components.PanelEditor.OptionsPane.fieldLabel('Value options Calculation')
    );
    await expect(calculationField).toBeVisible();
    await getByText('All values').click();
    await expect(calculationField).not.toBeVisible();
  });

  test('should display all circles when "All values" is enabled', async ({ page }) => {
    await page.getByLabel('Series count', { exact: true }).fill('1');
    const seriesCount = page.locator(`[data-testid^="${testIds.panel.circle()}"]`);
    await expect(seriesCount).toHaveCount(1);
    panelEditPage.collapseSection('Value options');
    await getByText('All values').click();
    await expect(await seriesCount.count()).toBeGreaterThan(1);
  });
});
