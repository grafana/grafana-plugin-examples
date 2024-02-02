# Grafana plugin examples

This repository contains example plugins to showcase different use cases.

## App plugins

| Example                                                       | Description                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [app-basic](examples/app-basic)                               | Shows how to build a basic app plugin that uses custom routing                            |
| [app-with-dashboards](examples/app-with-dashboards)           | Shows how to include pre-built dashboards in an app plugin                                |
| [app-with-backend](examples/app-with-backend)                 | Shows how to build an app plugin with its own backend                                     |
| [app-with-extensions](examples/app-with-extensions)           | Shows how to build an app plugin that extends the Grafana core UI                         |
| [app-with-extension-point](examples/app-with-extension-point) | Shows how to add an extension point in the plugin UI that can be extended by other plugins |
| [app-with-scenes](examples/app-with-scenes)                   | Shows how to build a basic app with [@grafana/scenes](https://github.com/grafana/scenes/)  |

## Panel plugins

| Example                                           | Description                                                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [panel-flot](examples/panel-flot)                 | Shows how to use the [Flot](http://www.flotcharts.org) plotting library in a panel plugin.                                        |
| [panel-frame-select](examples/panel-frame-select) | Shows how to update panel options with values from a data query response.                                                         |
| [panel-plotly](examples/panel-plotly)             | Shows how to use the [Plotly](https://plotly.com/javascript/) graphing library in a panel plugin.                                 |
| [panel-scatterplot](examples/panel-scatterplot)   | Shows how to use D3 and SVG to create a scatter plot panel.                                                                       |
| [panel-visx](examples/panel-visx)                 | Shows how to use [visx](https://github.com/airbnb/visx) to create a time series graph.                                            |
| [panel-basic](examples/panel-basic)               | Shows how to build a panel plugin that uses the time series graph from `@grafana/ui` to read and update the dashboard time range. |
| [panel-datalinks](examples/panel-datalinks)       | Shows how to build a panel plugin that uses the datalinks functionality of Grafana.                                               |

## Data source plugins

| Example                                                                   | Description                                                                                                          |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [datasource-http](examples/datasource-http)                               | Shows how to query data from HTTP-based APIs. The HTTP call happens on the frontend.                          |
| [datasource-http-backend](examples/datasource-http-backend)               | Shows how to query data from HTTP-based APIs, where the HTTP calls happens on the backend. Supports alerting. |
| [datasource-streaming-websocket](examples/datasource-streaming-websocket) | Shows how to create an event-based data source plugin using RxJS and WebSockets.                             |
| [datasource-streaming-backend-websocket](examples/datasource-streaming-backend-websocket) | Shows how to create an event-based data source plugin using backend streams.                             |
| [datasource-basic](examples/datasource-basic)                             | Shows how to build a basic data source plugin.                                                                |

> [!NOTE]
> The plugin examples in this repository use NPM to manage frontend dependencies. Whilst you are welcome to copy these examples and use Yarn or PNPM instead we offer no support for them.

## Integration tests

Some of the examples in this repository contain integration tests that make use of [`@grafana/e2e`](https://npmjs.com/package/@grafana/e2e) package. These tests can be run individually by navigating to the example plugin and running one of the following commands:

- `npm run e2e` - run integration tests
- `npm run e2e:open` - open cypress ui and run integration tests
- `npm run e2e:update` - run integration tests and update any screenshots

### Testing against latest versions of Grafana

The GitHub workflow `.github/workflows/integration-tests.yml` finds all plugin examples identified by the existence of `src/plugin.json`. For every example plugin build scripts will be run to confirm the plugins can be built against intended and canary NPM packages. Any example plugin that has a cypress directory defined will run the following:

1. Build the plugin with the provided version of Grafana packages and test against the provided version of Grafana
   - _asserting the plugin works with its expected versions_
2. Build the plugin with the provided version of Grafana packages and test against the latest version of Grafana
   - _asserting the plugin can run with the packages provided by the latest Grafana core_
3. Upgrade all Grafana NPM packages to the latest version and test against latest version of Grafana
   - _asserting the plugin can still build with the latest Grafana NPM packages_

## Using the examples as the base for your plugins

All of the examples use [grafana/create-plugin](https://grafana.com/developers/plugin-tools) instead of `@grafana/toolkit`.

You can read more about customizing and extending the base configuration in our [documentation](https://grafana.com/developers/plugin-tools/create-a-plugin/extend-a-plugin/extend-configurations).

## API Compatibility

If your plugin uses TypeScript, then you can use [`@grafana/levitate`](https://github.com/grafana/levitate/) to test if the Grafana APIs your plugin is using are compatible with a certain version of Grafana.

For example, to see a compatibility report of your plugin code and the latest release of the grafana APIs, use:

```
npx @grafana/levitate@latest is-compatible --path src/module.ts --target @grafana/data,@grafana/ui,@grafana/runtime

```

You may also specify a target version:

```
npx @grafana/levitate@latest is-compatible --path src/module.ts --target @grafana/data@9.0.5,@grafana/ui@9.0.5,@grafana/runtime@9.0.5

```

The following GitHub workflow example can be used in your project to keep an eye on the compatibility of your plugin and the grafana API.

If you host your project in GitHub and want to use [GitHub Actions](https://docs.github.com/en/actions), then you could create a new file in your project in `.github/workflows/levitate.yml` and add the following content:

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
          node-version: "20"
      - name: Install dependencies
        run: npm install
      - name: Build plugin
        run: npm run build
      - name: Compatibility check
        uses: grafana/plugin-actions/is-compatible@v1
        with:
          module: "./src/module.ts"
          comment-pr: "yes"
          fail-if-incompatible: "no"
```

This runs a compatibility check for the latest release of Grafana plugins API in your project every time a new push or pull request is open. If it finds an error you will see a message indicating you have an incompatibility.

Sometimes incompatibilities are minor. For example, a type changed but this doesn't affect your plugin. We recommend that you upgrade your Grafana dependencies if this is the case so you always use the latest API.
