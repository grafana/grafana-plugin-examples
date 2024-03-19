import {
  test as base,
  AppPage,
  PluginTestCtx,
  PluginPageArgs,
} from "@grafana/plugin-e2e";
import pluginJson from "../src/plugin.json";

class PageOne extends AppPage {
  private path: string;

  constructor(ctx: PluginTestCtx, args: PluginPageArgs & { path: string }) {
    super(ctx, args);
    this.path = args.path;
  }

  goto(): Promise<void> {
    return super.goto({ path: this.path });
  }
}

type AppTestFixture = {
  pageOne: PageOne;
};

export const test = base.extend<AppTestFixture>({
  pageOne: async (
    { page, selectors, grafanaVersion, request },
    use,
    testInfo
  ) => {
    await use(
      new PageOne(
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
