# Data Source HTTP Plugin for Grafana

This repository contains a data source plugin that uses HTTP through Grafana's data source HTTP proxy.
## Overview

The Grafana HTTP Data Source Plugin shows the integration of a backend HTTP service as a custom data source within Grafana. This plugin serves as a reference implementation for developers seeking to incorporate HTTP-based data sources into their Grafana dashboards.

Grafana supports a wide range of data sources, including Prometheus, MySQL, and Datadog. There’s a good chance you can already visualize metrics from the systems you have set up. In some cases, though, you already have an in-house metrics solution that you’d like to add to your Grafana dashboards. Grafana data source plugins enable you to integrate such solutions with Grafana.

This plugin differs from the `datasource-http-backend` example because the data fetching happens through Grafana's data source HTTP proxy rather than going through the plugin backend.

## Get started

Data source plugins consist of a frontend component. Install this component with the following CLI commands.

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

## Learn more

- [Grafana plugins documentation](https://grafana.com/developers/plugin-tools/)
- [Grafana UI components documentation](https://developers.grafana.com/ui/latest/index.html)
- [Build a data source plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)