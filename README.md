# Grafana plugin examples

This repository contains example plugins to showcase different use cases.

## Panel plugins

- [flot](examples/flot) demonstrates how to use the [Flot](http://www.flotcharts.org) plotting library in a panel plugin.
- [frame-select](examples/frame-select) demonstrates how to update panel options with values from a data query response.
- [plotly](examples/plotly) demonstrates how to use the [Plotly](https://plotly.com/javascript/) graphing library in a panel plugin.
- [scatterplot](examples/scatterplot) demonstrates how to use D3 and SVG to create a scatter plot panel.
- [visx](examples/visx) demonstrates how to use [visx](https://github.com/airbnb/visx) to create a time series graph.
- [basic-panel](examples/basic-panel) demonstrates how to build a panel plugin that uses the time series graph from `@grafana/ui` to read and update the dashboard time range.

## Data source plugins

- [http](examples/http-datasource) demonstrates how to query data from HTTP-based APIs.
- [streaming-websocket](examples/streaming-websocket) demonstrates how to create an event-based data source plugin using RxJS and web sockets.
- [basic-datasource](examples/basic-datasource) demonstrates how to build a basic data source plugin.
