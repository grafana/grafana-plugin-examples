import { AppConfigPage, AppPage, test as base } from '@grafana/plugin-e2e';
import pluginJson from '../src/plugin.json';

type AppTestFixture = {
  appConfigPage: AppConfigPage;
  gotoPage: (path?: string) => Promise<AppPage>;
};

export const test = base.extend<AppTestFixture, { workerStorageState: string }>({
  appConfigPage: async ({ gotoAppConfigPage }, use) => {
    const configPage = await gotoAppConfigPage({
      pluginId: pluginJson.id,
    });
    await use(configPage);
  },
  gotoPage: async ({ gotoAppPage }, use) => {
    await use((path) =>
      gotoAppPage({
        path,
        pluginId: pluginJson.id,
      })
    );
  },
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({}, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const context = await request.newContext({ storageState: undefined });

      // Acquire a unique account, for example create a new one.
      // Alternatively, you can have a list of precreated accounts for testing.
      // Make sure that accounts are unique, so that multiple team members
      // can run tests at the same time without interference.
      const account = await acquireAccount(id);

      // Send authentication request. Replace with your own.
      await context.post('https://github.com/login', {
        form: {
          user: 'user',
          password: 'password',
        },
      });

      await context.storageState({ path: fileName });
      await context.dispose();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@grafana/plugin-e2e';
