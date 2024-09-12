# Streaming Backend WebSocket Data Source Plugin for Grafana

This repository contains a streaming data source plugin complete with WebSocket integration.
## Overview

The Streaming WebSocket Backend Data Source Plugin serves as a reference implementation for developers seeking to incorporate WebSocket-based services into their Grafana dashboards for streaming data scenarios.

The plugin connects to the backend through a streaming connection and the backend establishes a connection to an external WebSocket server.

The example server sends random numbers controlled by a query parameter.

## Get started

1. Build the data source plugin:

  ```sh
cd streaming-backend-websocket-plugin
mage -v
npm install
npm run build
  ```

2. Run the Grafana and the example WebSocket server with Docker compose:

```sh
cd streaming-backend-websocket-plugin
docker compose up -d # or docker-compse up -d for old docker versions
```

The server can be accessed by the Grafana backend in `ws://websocket-server:8080`.

Refer to the [`docker-compose.yaml`](./streaming-backend-websocket-plugin/docker-compose.yaml) for more details.

## Packages

### `streaming-backend-websocket-plugin`

This package contains a Grafana data source plugin that establishes a connection to a WebSocket server, and updates the visualization whenever it receives a new message.

### `websocket-server`

This package contains a WebSocket server that returns random values at random intervals.

## Learn more

- [Grafana plugins documentation](https://grafana.com/developers/plugin-tools/)
- [Build a data source plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)