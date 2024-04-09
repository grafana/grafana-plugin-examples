import { test, expect } from '@grafana/plugin-e2e';
import pluginJson from '../src/plugin.json';
import { testIds } from '../src/components/testIds';

test('should extend the actions menu with a link to a-app plugin', async ({ page }) => {
  await page.goto(`/a/${pluginJson.id}/one`);
  await page.getByTestId(testIds.actions.button).click();
  await page.getByTestId(testIds.container).getByText('Go to A').click();
  await page.getByTestId(testIds.modal.open).click();
  await expect(page.getByTestId(testIds.appA.container)).toBeVisible();
});

test('should extend the actions menu with a command triggered from b-app plugin', async ({ page }) => {
  await page.goto(`/a/${pluginJson.id}/one`);
  await page.getByTestId(testIds.actions.button).click();
  await page.getByTestId(testIds.container).getByText('Open from B').click();
  await expect(page.getByTestId(testIds.appB.modal)).toBeVisible();
});

// it('should extend the actions menu with a command triggered from b-app plugin', () => {
//   actions.button().should('be.visible').click();
//   container().within(() => cy.get(menuItem).contains('Open from B').click());
//   appB.modal().should('be.visible');
// });
