# Basic Panel Plugin for Grafana

This repository contains an example plugin for Grafana called Basic Panel Plugin. It serves as a foundational example for creating custom panel plugins within Grafana.

## Overview

The Basic Panel Plugin demonstrates the fundamental structure and functionality required for developing custom panels in Grafana. It provides a starting point for developers looking to create their own custom visualizations or extend Grafana's capabilities. 

Panel plugins allow you to add new types of visualizations to your dashboard, such as maps, clocks, pie charts, lists, and more. Use panel plugins when you want to do things like visualize data returned by data source queries, navigate between dashboards, or control external systems (such as smart home devices).

The definition for the Basic Panel Plugin is provided in []`/src/components/SimplePanel/SimplePanel.tsx`](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/panel-basic/src/components/SimplePanel/SimplePanel.tsx).

The plugin uses `TimeSeries` from the `grafana-ui` package to build a graph with the properties passed to the panel. The plugin also allows a tooltip to be shown when the user hovers over a visualization. Additionally, the plugin is set up to allow custom options such as a gradient mode selector and a list display mode to be configured from the Grafana sidebar.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the plugin in development mode and run inside Grafana using Docker:

   ```bash
   # Start watching for changes
   npm run dev

   # Run Grafana inside a Docker container in a separate session
   docker-compose up
   ```

3. Build plugin in production mode:

   ```bash
   npm run build
   ```

4. Run e2e tests:

   ```bash
   npm run e2e
   ```

## Learn more

- [Grafana developer portal](https://grafana.com/developers)
- [Build a panel plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
