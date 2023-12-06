# Grafana Basic Panel Plugin example

This is an example on how to build a basic panel plugin.

## What is a Grafana panel plugin?

Panel plugins allow you to add new types of visualizations to your dashboard, such as maps, clocks, pie charts, lists, and more.

Use panel plugins when you want to do things like visualize data returned by data source queries, navigate between dashboards, or control external systems (such as smart home devices).

## Getting started

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Build plugin in development mode and run inside Grafana using Docker:

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

- [Build a panel plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin)
- [Grafana plugins documentation](https://grafana.com/developers/plugin-tools/)
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
