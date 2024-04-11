# Grafana Panel Plugin with Datalinks example

This template is a starting point for building a panel plugin with data links for Grafana.

## What are Grafana panel plugins?

Panel plugins allow you to add new types of visualizations to your dashboard, such as maps, clocks, pie charts, lists, and more.

Use panel plugins when you want to do things like visualize data returned by data source queries, navigate between dashboards, or control external systems (such as smart home devices).

## Get started

### Frontend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build plugin in development mode or run in watch mode:

   ```bash
   npm run dev
   ```

3. Build plugin in production mode:

   ```bash
   npm run build
   ```

4. Run the tests (using Jest):

   ```bash
   # Runs the tests and watches for changes
   npm run test

   # Exists after running all the tests
   npm run lint:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker):

   ```bash
   npm run server
   ```

6. Run the E2E tests:

   ```bash
   # Spin up a Grafana instance first that we tests against
   npm run server

   # Start the tests
   npm run e2e
   ```

7. Run the linter:

   ```bash
   npm run lint

   # or

   npm run lint:fix
   ```

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Basic panel plugin example](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/panel-basic#readme)
- [Plugin.json documentation](https://grafana.com/developers/plugin-tools/reference-plugin-json)
- [Sign a plugin](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin/)
