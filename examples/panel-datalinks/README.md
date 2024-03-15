# Panel Datalinks Plugin for Grafana

This repository contains an example plugin for Grafana called Panel Datalinks Plugin. It demonstrates how to create a custom panel plugin that adds interactive data links to Grafana dashboards.

## Overview

The Panel Datalinks plugin enhances the functionality of Grafana dashboards by allowing users to add custom links to specific data points or series within panels. These links can lead to external resources or other dashboards, providing users with quick access to additional information or related content.

The definition for the panel is provided in [`/src/components/DataLinksPanel.tsx`](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/panel-datalinks/src/components/DataLinksPanel.tsx).

The plugin uses `DataLinksContextMenu` from the `grafana-ui` package to build data links with the properties passed to the panel. The plugin also styles the panel according to custom styles passed to `grafana-ui`.

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

6. Run the E2E tests (using Cypress):

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

- [Grafana developer portal](https://grafana.com/developers)
- [Build a panel plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
