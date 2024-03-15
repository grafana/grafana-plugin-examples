import { test as base, AppPage } from "@grafana/plugin-e2e";
import pluginJson from "../src/plugin.json";

type AppTestFixture = {
  pageOne: AppPage;
};

export const test = base.extend<AppTestFixture>({
  pageOne: async (
    { page, selectors, grafanaVersion, request },
    use,
    testInfo
  ) => {
    await use(
      new AppPage(
        { page, selectors, grafanaVersion, request, testInfo },
        {
          pluginId: pluginJson.id,
          path: "/one",
        }
      )
    );
  },
});

export { expect } from "@grafana/plugin-e2e";
