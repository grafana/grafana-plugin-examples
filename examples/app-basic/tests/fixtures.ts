import { AppConfigPage, AppPage, test as base } from '@grafana/plugin-e2e';
import pluginJson from '../src/plugin.json';

type AppTestFixture = {
  appConfigPage: AppConfigPage;
  gotoPage: (path?: string) => Promise<AppPage>;
};

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
  gotoPage: ({ gotoAppPage }, use) =>
    use((path) =>
      gotoAppPage({
        path,
        pluginId: pluginJson.id,
      })
    ),
});

export { expect } from '@grafana/plugin-e2e';
