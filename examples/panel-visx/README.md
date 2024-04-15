# Visx Panel Plugin for Grafana

This repository provides an illustration of how to develop a custom panel plugin that leverages the [Visx library](https://github.com/airbnb/visx) to create interactive data visualizations within Grafana dashboards.

## Overview

The Visx Panel Plugin showcases the integration of [Visx](https://github.com/airbnb/visx), a collection of expressive, low-level React components for building visualizations, within Grafana. Visx empowers developers to create highly customizable and performant data visualizations in a React-friendly environment.

The definition for the plugin is provided in [/src/SimplePanel.tsx](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/panel-visx/src/SimplePanel.tsx). 

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

- [Visx](https://github.com/airbnb/visx)
- [Grafana developer portal](https://grafana.com/developers)
- [Build a panel plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
