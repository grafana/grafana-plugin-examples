# Grafana plugin examples

This repository contains example plugins to showcase different use cases.

## App plugins

| Example                                             | Description                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| [app-basic](examples/app-basic)                     | demonstrates how to build a basic app plugin that uses custom routing.    |
| [app-with-dashboards](examples/app-with-dashboards) | demonstrates how to include pre-built dashboards in an app plugin.        |
| [app-with-backend](examples/app-with-backend)       | demonstrates how to build an app plugin with its own backend.             |
| [app-with-extensions](examples/app-with-extensions) | demonstrates how to build an app plugin that extends the garfana core ui. |

## Panel plugins

| Example                                           | Description                                                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [panel-flot](examples/panel-flot)                 | demonstrates how to use the [Flot](http://www.flotcharts.org) plotting library in a panel plugin.                                        |
| [panel-frame-select](examples/panel-frame-select) | demonstrates how to update panel options with values from a data query response.                                                         |
| [panel-plotly](examples/panel-plotly)             | demonstrates how to use the [Plotly](https://plotly.com/javascript/) graphing library in a panel plugin.                                 |
| [panel-scatterplot](examples/panel-scatterplot)   | demonstrates how to use D3 and SVG to create a scatter plot panel.                                                                       |
| [panel-visx](examples/panel-visx)                 | demonstrates how to use [visx](https://github.com/airbnb/visx) to create a time series graph.                                            |
| [panel-basic](examples/panel-basic)               | demonstrates how to build a panel plugin that uses the time series graph from `@grafana/ui` to read and update the dashboard time range. |
| [panel-datalinks](examples/panel-datalinks)       | demonstrates how to build a panel plugin that uses the datalinks functionality of Grafana.                                               |

## Data source plugins

| Example                                                                   | Description                                                                                                          |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [datasource-http](examples/datasource-http)                               | demonstrates how to query data from HTTP-based APIs. The HTTP call happens on the frontend.                          |
| [datasource-http-backend](examples/datasource-http-backend)               | demonstrates how to query data from HTTP-based APIs, where the HTTP calls happens on the backend. Supports alerting. |
| [datasource-streaming-websocket](examples/datasource-streaming-websocket) | demonstrates how to create an event-based data source plugin using RxJS and web sockets.                             |
| [datasource-basic](examples/datasource-basic)                             | demonstrates how to build a basic data source plugin.                                                                |

## Integration tests

Some of the examples in this repository contain integration tests that make use of [`@grafana/e2e`](https://npmjs.com/package/@grafana/e2e) package. These tests can be run individually by navigating to the example plugin and running one of the following commands:

- `yarn e2e` - run integration tests
- `yarn e2e:open` - open cypress ui and run integration tests
- `yarn e2e:update` - run integration tests and update any screenshots

### Testing against latest versions of Grafana

There is a github workflow `.github/workflows/integration-tests.yml` which navigates all plugin examples looking for integration tests to run. For any example plugin that has a `e2e` npm script defined it will run the following:

1. Build the plugin with the provided version of Grafana packages and test against the provided version of Grafana
   - _asserting the plugin works with its expected versions_
1. Build the plugin with the provided version of Grafana packages and test against the latest version of Grafana
   - _asserting the plugin can run with the packages provided by the latest Grafana core_
1. Upgrade all Grafana NPM packages to the latest version and test against latest version of Grafana
   - _asserting the plugin can still build with the latest Grafana NPM packages_

## Using the examples as the base for your plugins

All of the examples use [grafana/create-plugin](https://github.com/grafana/create-plugin/) instead of `@grafana/toolkit`.

You can read more about customizing and extending the base configuration [here](https://github.com/grafana/create-plugin/#customizing-or-extending-the-basic-configs)

## API Compatibility

If your plugin uses typescript you can use [`@grafana/levitate`](https://github.com/grafana/levitate/) to test if the Grafana APIs your plugin is using are compatible with a certain version of Grafana.

e.g. to see a compatibility report of your plugin code and the latest release of the grafana APIs

```
npx @grafana/levitate@latest is-compatible --path src/module.ts --target @grafana/data,@grafana/ui,@grafana/runtime

```

you may also specify a target version

```
npx @grafana/levitate@latest is-compatible --path src/module.ts --target @grafana/data@9.0.5,@grafana/ui@9.0.5,@grafana/runtime@9.0.5

```

The following github workflow example can be used in your project to keep an eye on the compatibility of your plugin and the grafana API.

If you host your project in GitHub and want to use [GitHub Actions](https://docs.github.com/en/actions). You could create a new file in your project in `.github/workflows/levitate.yml` and put the following content:

```yaml
name: Compatibility check
on: [push]

jobs:
  compatibilitycheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "16"
      - name: Install dependencies
        run: yarn install
      - name: Build plugin
        run: yarn build
      - name: Compatibility check
        uses: grafana/plugin-actions/is-compatible@v1
        with:
          module: "./src/module.ts"
          comment-pr: "yes"
          fail-if-incompatible: "no"
```

This will run a compatibility check for the latest release of grafana plugins API in your project everytime a new push or pull request is open. If it reports an error you will see a message indicating you have an incompatibility.

Sometimes incompatibilities are minor. e.g. a type changed but this doesn't affect your plugin. We advice you to upgrade your grafana dependencies if this is the case so you always use the latest API.
