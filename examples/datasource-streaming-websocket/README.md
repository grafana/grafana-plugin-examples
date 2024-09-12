# Streaming WebSocket Data Source Plugin for Grafana

This repository provides an example of how to implement a Grafana data source plugin with streaming support.

## Overview

The Streaming WebSocket Data Source Plugin illustrates the integration of WebSocket-based data sources into Grafana dashboards. This plugin serves as a reference implementation for developers aiming to incorporate real-time streaming data into their Grafana visualizations.

This server returns random numeric values at random intervals.

## Get started

- Start the WebSocket server:

  ```
  cd websocket-server
  npm run dev
  ```

- Build the data source plugin:

  ```
  cd streaming-plugin
  npm run dev
  ```

## Packages

### `streaming-plugin`

This package contains a Grafana data source plugin that establishes a connection to a WebSocket server, and updates the visualization whenever it receives a new message.

### `websocket-server`

This package contains a WebSocket server that returns random values at random intervals.

## Learn more

- [Grafana plugins documentation](https://grafana.com/developers/plugin-tools/)
- [Grafana UI components documentation](https://developers.grafana.com/ui/latest/index.html)
- [Build a data source plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
