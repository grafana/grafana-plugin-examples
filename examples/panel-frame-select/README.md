# Frame Select Panel Plugin for Grafana

This repository contains an example plugin for Grafana called Frame Select Panel Plugin.  It showcases how panel plugins can read [data frames](https://grafana.com/developers/plugin-tools/introduction/data-frames) and act on them.

## Overview

The Frame Select Panel Plugin enhances the functionality of Grafana dashboards by allowing users to dynamically switch between different data frames. This feature is particularly useful when visualizing multiple datasets or comparing various metrics within the same dashboard.

The definition for the panel is provided in [/src/SimplePanel.tsx](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/panel-frame-select/src/SimplePanel.tsx).

This example shows how you can set panel options based on the response from a data query.

You can use the `onOptionsChange` prop from `PanelProps` to update the value of panel options.

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

- [Data frames](https://grafana.com/developers/plugin-tools/introduction/data-frames)
- [Grafana developer portal](https://grafana.com/developers)
- [Build a panel plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
