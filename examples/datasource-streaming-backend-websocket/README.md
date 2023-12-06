# Grafana Data Source Streaming Backend Plugin example

This is an example of how to implement a Grafana data source plugin with streaming backend support.

The plugin connects to the backend through a streaming connection and the backend establishes a connection to an external websocket server.

## Build

Build the data source plugin

  ```sh
cd streaming-backend-websocket-plugin
mage -v
yarn install
yarn build
  ```

and run the Grafana and the example websocket server with Docker compose:

```sh
cd streaming-backend-websocket-plugin
docker compose up -d # or docker-compse up -d for old docker versions
```

The server can be accessed by the Grafana backend in `ws://websocket-server:8080`.

Refer to the [`docker-compose.yaml`](./streaming-backend-websocket-plugin/docker-compose.yaml) for more details.

The example server sends random numbers controlled by a query parameter.

## Packages

### `streaming-backend-websocket-plugin`

This package contains a Grafana data source plugin that establishes a connection to a WebSocket server, and updates the visualization whenever it receives a new message.

### `websocket-server`

This package contains a WebSocket server that returns random values at random intervals.
