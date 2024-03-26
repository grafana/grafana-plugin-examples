# Plotly Panel Plugin for Grafana

This repository contains an example plugin for Grafana called Plotly Panel Plugin. It showcases how to integrate the [Plotly library](https://plotly.com/) into Grafana to create interactive and visually appealing visualizations.

## Overview

The Plotly Panel Plugin integrates the [Plotly](https://plotly.com/) JavaScript library with Grafana, enabling users to create dynamic and interactive charts within their Grafana dashboards. Plotly's powerful features and extensive customization options empower users to visualize their data in compelling ways.

The definition for Plotly Panel Plugin is provided in [`/src/PlotlyPanel.tsx`](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/panel-plotly/src/PlotlyPanel.tsx). The plugin also allows customization of the Grafana theme.

## Get started

### Frontend

1. Install dependencies:

    ```
    npm add react-plotly.js plotly.js
    npm add --dev @types/react-plotly.js
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

- [React Plotly.js](https://plotly.com/javascript/react/)
- [Grafana developer portal](https://grafana.com/developers)
- [Build a panel plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
