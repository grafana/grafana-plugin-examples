# Grafana Streaming Data Source WebSocket Plugin example

This is an example of how to implement a Grafana data source plugin with streaming support.

## Build

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
