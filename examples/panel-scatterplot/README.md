# Scatterplot Panel Plugin for Grafana

Welcome to the Scatterplot Panel Plugin example for Grafana! This repository provides an illustration of how to develop a custom panel plugin that enables users to create [scatterplot](https://en.wikipedia.org/wiki/Scatter_plot) (also known as scatter plot) visualizations within Grafana dashboards.

## Overview

The Scatterplot Panel Plugin enhances the capabilities of Grafana dashboards by offering users the ability to create interactive scatterplots. Scatterplots are invaluable tools for visualizing relationships between two variables, making them ideal for exploratory data analysis and pattern identification.

This is a plugin example of visualizing a scatterplot using SVG, the XML-based scalable vector graphic format, and [D3.js](https://d3js.org/). D3.js, short for Data-Driven Documents, is a JavaScript library commonly used for creating dynamic and interactive data visualizations in web browsers. 

The definition for this plugin is provided in [/src/ScatterPanel.tsx](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/panel-scatterplot/src/ScatterPanel.tsx). The plugin also allows customization of the Grafana theme.

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

- [D3.js](https://d3js.org/)
- [Grafana developer portal](https://grafana.com/developers)
- [Build a panel plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)