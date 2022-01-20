# Streaming example

This is an example of how to implement a Grafana data source plugin with streaming support.

## Build

- Start the WebSocket server:

  ```
  cd websocket-server
  yarn dev
  ```

- Build the data source plugin

  ```
  cd streaming-plugin
  yarn dev
  ```

## Packages

### `streaming-plugin`

This package contains a Grafana data source plugin that establishes a connection to a WebSocket server, and updates the visualization whenever it receives a new message.

### `websocket-server`

This package contains a WebSocket server that returns random values at random intervals.
