import * as semver from 'semver';

import { expect, test } from '@grafana/plugin-e2e';

test.use({
  featureToggles: {
    localizationForPlugins: true,
  },
  userPreferences: {
    language: 'sv-SE',
  },
});

test('should display correct translation based on Grafana version (Swedish for v12.1+, English fallback for v11-12.0)', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  grafanaVersion,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

  const isVersion12Point1OrHigher = semver.gte(grafanaVersion, '12.1.0');

  if (isVersion12Point1OrHigher) {
    await expect(panelEditPage.panel.locator.getByText('Textalternativ värde:')).toBeVisible();
    const options = panelEditPage.getCustomOptions('Basic');
    const showSeriesCounter = options.getSwitch('Visa serieräknare');
    await expect(showSeriesCounter.locator()).toBeVisible();
  } else {
    await expect(panelEditPage.panel.locator.getByText('Text option value:')).toBeVisible();
    const options = panelEditPage.getCustomOptions('Basic');
    const showSeriesCounter = options.getSwitch('Show series counter');
    await expect(showSeriesCounter.locator()).toBeVisible();
  }
});
