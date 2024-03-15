# Flot Panel Plugin for Grafana

This repository contains an example plugin for Grafana called Flot Panel Plugin. It demonstrates how to integrate the [Flot library](https://www.flotcharts.org) into Grafana to create interactive and customizable visualizations.

## Overview

The Flot Panel plugin showcases the integration of the [Flot library](https://www.flotcharts.org), a JavaScript plotting library for jQuery, with Grafana. It allows users to create rich and dynamic visualizations within Grafana dashboards using Flot's powerful features.

The definition for Flot Panel is provided in [`/src/FlotPanel.tsx`](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/panel-flot/src/FlotPanel.tsx). The plugin allows you to customize Grafana styles.

As Flot is used by several of the built-in panels in Grafana, it's already available to your plugin without any additional dependencies.

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
