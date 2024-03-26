import { AppConfigPage, test as base } from '@grafana/plugin-e2e';
import pluginJson from '../src/plugin.json';

type AppTestFixture = { appConfigPage: AppConfigPage };

export const test = base.extend<AppTestFixture>({
  appConfigPage: async ({ page, selectors, grafanaVersion, request }, use, testInfo) => {
    const configPage = new AppConfigPage(
      { page, selectors, grafanaVersion, request, testInfo },
      {
        pluginId: pluginJson.id,
      }
    );
    await configPage.goto();
    await use(configPage);
  },
});

export { expect } from '@grafana/plugin-e2e';
