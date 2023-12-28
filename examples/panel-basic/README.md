# Grafana Panel Plugin

This example provides a template for how to build a basic panel plugin. The entry point is `/src/components/SimplePanel/SimplePanel.tsx`.

By default, the plugin uses `TimeSeries` from the `grafana-ui` package to build a graph with the properties of `SimplePanel`. The plugin also allows a tooltip to be shown when user hovers over a visualization.

Additionally, the plugin is configured to allow features such as a gradient mode selector and a list display mode on the Grafana sidebar.

## What is a Grafana panel plugin?

Panel plugins allow you to add new types of visualizations to your dashboard, such as maps, clocks, pie charts, lists, and more.

Use panel plugins when you want to do things like visualize data returned by data source queries, navigate between dashboards, or control external systems (such as smart home devices).

## Getting started

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Build the plugin in development mode and run inside Grafana using Docker:

   ```bash
   # Start watching for changes
   yarn dev

   # Run Grafana inside a docker container in a separate session
   docker-compose up
   ```

3. Build plugin in production mode:

   ```bash
   yarn build
   ```

4. Run e2e tests:

   ```bash
   yarn e2e
   ```

## Learn more

- [Grafana developer portal](https://grafana.com/developers)
- [Build a panel plugin tutorial](https://grafana.com/tutorials/build-a-panel-plugin/)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
