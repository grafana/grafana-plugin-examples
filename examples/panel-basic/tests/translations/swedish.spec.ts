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

test('should display correct translation based on Grafana version (Swedish for v11+, English fallback for <v11)', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  grafanaVersion,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

  const isVersion11OrHigher = semver.gte(grafanaVersion, '11.0.0');

  if (isVersion11OrHigher) {
    // For Grafana v11+, expect Swedish translations
    await expect(panelEditPage.panel.locator.getByText('Textalternativ värde:')).toBeVisible();
    const options = panelEditPage.getCustomOptions('Basic');
    const showSeriesCounter = options.getSwitch('Visa serieräknare');
    await expect(showSeriesCounter.locator()).toBeVisible();
  } else {
    // For Grafana <v11, expect English fallback
    await expect(panelEditPage.panel.locator.getByText('Text option value:')).toBeVisible();
    const options = panelEditPage.getCustomOptions('Basic');
    const showSeriesCounter = options.getSwitch('Show series counter');
    await expect(showSeriesCounter.locator()).toBeVisible();
  }
});
