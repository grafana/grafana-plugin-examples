import pluginJson from '../src/plugin.json';
import { test as base } from '@playwright/test';

// Should be imported from plugin-e2e
class AppConfigPage {
  private pluginId: string;

  constructor(args: { pluginId: string }) {
    this.pluginId = args.pluginId;
  }
}

export const test = base.extend<{ appConfigPage: AppConfigPage }>({
  appConfigPage: async (ctx, use) => {
    await use(
      new AppConfigPage(ctx, {
        pluginId: pluginJson.id,
      })
    );
  },
});

export { expect } from '@playwright/test';
