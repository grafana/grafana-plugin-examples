import { expect, test } from '@grafana/plugin-e2e';

test.use({
  featureToggles: {
    localizationForPlugins: true,
  },
  userPreferences: {
    language: 'es-ES',
  },
});

test('should display Spanish plugin translations for all supported versions (>=11.0.0)', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

  await expect(panelEditPage.panel.locator.getByText('Valor de la opción de texto:')).toBeVisible();
  const options = panelEditPage.getCustomOptions('Basic');
  const showSeriesCounter = options.getSwitch('Mostrar contador de series');
  await expect(showSeriesCounter.locator()).toBeVisible();
});
