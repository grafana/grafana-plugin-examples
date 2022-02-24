# Grafana plugin examples

This repository contains example plugins to showcase different use cases.

## Panel plugins

- [panel-flot](examples/panel-flot) demonstrates how to use the [Flot](http://www.flotcharts.org) plotting library in a panel plugin.
- [panel-frame-select](examples/panel-frame-select) demonstrates how to update panel options with values from a data query response.
- [panel-plotly](examples/panel-plotly) demonstrates how to use the [Plotly](https://plotly.com/javascript/) graphing library in a panel plugin.
- [panel-scatterplot](examples/panel-scatterplot) demonstrates how to use D3 and SVG to create a scatter plot panel.
- [panel-visx](examples/panel-visx) demonstrates how to use [visx](https://github.com/airbnb/visx) to create a time series graph.
- [panel-basic](examples/panel-basic) demonstrates how to build a panel plugin that uses the time series graph from `@grafana/ui` to read and update the dashboard time range.

## Data source plugins

- [datasource-http](examples/datasource-http) demonstrates how to query data from HTTP-based APIs.
- [datasource-streaming-websocket](examples/datasource-streaming-websocket) demonstrates how to create an event-based data source plugin using RxJS and web sockets.
- [datasource-basic](examples/datasource-basic) demonstrates how to build a basic data source plugin.
