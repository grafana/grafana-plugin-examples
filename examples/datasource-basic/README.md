# Basic Data Source Plugin for Grafana

[![Build](https://github.com/grafana/grafana-starter-datasource/workflows/CI/badge.svg)](https://github.com/grafana/grafana-starter-datasource/actions?query=workflow%3A%22CI%22)

This example provides a template for how to build a simple backend data source plugin. 
## Overview

The Basic Data Source Plugin offers a streamlined starting point for developers to understand the essential structure and functionality required for adding their own data sources to Grafana.

Grafana supports a wide range of data sources, including Prometheus, MySQL, and Datadog. There’s a good chance you can already visualize metrics from the systems you have set up. In some cases, though, you already have an in-house metrics solution that you’d like to add to your Grafana dashboards. Grafana data source plugins enable you to integrate such solutions with Grafana.

## Get started

Data source plugins may consist of a frontend or a backend component.  This example shows a data source plugin with a backend component. Install this component with the following CLI commands.

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

### Backend

1. Update [Grafana Plugin SDK for Go](https://grafana.com/developers/plugin-tools/introduction/grafana-plugin-sdk-for-go) dependency to the latest minor version:

   ```bash
   go get -u github.com/grafana/grafana-plugin-sdk-go
   go mod tidy
   ```

2. Build backend plugin binaries for Linux, Windows and Darwin:

   ```bash
   mage -v
   ```

3. List all available Mage targets for additional commands:

   ```bash
   mage -l
   ```

## Learn more

- [Grafana plugins documentation](https://grafana.com/developers/plugin-tools/)
- [Grafana UI components documentation](https://developers.grafana.com/ui/latest/index.html)
- [Build a data source plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
