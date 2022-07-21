# Basic Panel Plugin

This is an example on how to build a basic panel plugin.

## What is Grafana Panel Plugin?

Panel plugins allow you to add new types of visualizations to your dashboard, such as maps, clocks, pie charts, lists, and more.

Use panel plugins when you want to do things like visualize data returned by data source queries, navigate between dashboards, or control external systems (such as smart home devices).

## Getting started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode and run inside Grafana using Docker

   ```bash
   # Start watching for changes
   yarn dev

   # Run Grafana inside a docker container in a separate session
   docker-compose up
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

4. Run e2e tests

   ```bash
   yarn e2e
   ```

## Learn more

- [Build a panel plugin tutorial](https://grafana.com/tutorials/build-a-panel-plugin/)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
