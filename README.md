# Grafana plugin examples

This repository contains example plugins to showcase different use cases.

## Panel plugins

| Example                                           | Description                                                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [panel-flot](examples/panel-flot)                 | demonstrates how to use the [Flot](http://www.flotcharts.org) plotting library in a panel plugin.                                        |
| [panel-frame-select](examples/panel-frame-select) | demonstrates how to update panel options with values from a data query response.                                                         |
| [panel-plotly](examples/panel-plotly)             | demonstrates how to use the [Plotly](https://plotly.com/javascript/) graphing library in a panel plugin.                                 |
| [panel-scatterplot](examples/panel-scatterplot)   | demonstrates how to use D3 and SVG to create a scatter plot panel.                                                                       |
| [panel-visx](examples/panel-visx)                 | demonstrates how to use [visx](https://github.com/airbnb/visx) to create a time series graph.                                            |
| [panel-basic](examples/panel-basic)               | demonstrates how to build a panel plugin that uses the time series graph from `@grafana/ui` to read and update the dashboard time range. |

## Data source plugins

| Example                                                                   | Description                                                                              |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [datasource-http](examples/datasource-http)                               | demonstrates how to query data from HTTP-based APIs.                                     |
| [datasource-streaming-websocket](examples/datasource-streaming-websocket) | demonstrates how to create an event-based data source plugin using RxJS and web sockets. |
| [datasource-basic](examples/datasource-basic)                             | demonstrates how to build a basic data source plugin.                                    |

## Integration tests

Some of the examples in this repository contain integration tests that make use of [`@grafana/e2e`](https://npmjs.com/package/@grafana/e2e) package. These tests can be run individually by navigating to the example plugin and running one of the following commands:

- `yarn e2e` - run integration tests
- `yarn e2e:open` - open cypress ui and run integration tests
- `yarn e2e:update` - run integration tests and update any screenshots

### Testing against latest versions of Grafana

There is a script `scripts/test-runner.mjs` which navigates all plugin examples looking for integration tests to run. For any example plugin that has a `e2e` npm script defined it will run the following:

1. Build the plugin with the provided version of Grafana packages and test against the provided version of Grafana
   - _asserting the plugin works with its expected versions_
1. Build the plugin with the provided version of Grafana packages and test against the latest version of Grafana
   - _asserting the plugin can run with the packages provided by the latest Grafana core_
1. Upgrade all Grafana NPM packages to the latest version and test against latest version of Grafana
   - _asserting the plugin can still build with the latest Grafana NPM packages_

Executing the script relies on [`zx`](https://github.com/google/zx). To execute it run:

```shell
npx zx scripts/test-runner.mjs
```
