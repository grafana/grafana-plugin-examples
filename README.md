# Grafana plugin examples

This repository contains example plugins to showcase different use cases.

The examples in this website were auto-generated from the existing templates in [create-plugin](https://github.com/grafana/plugin-tools/tree/main/packages/create-plugin).

## App plugins

| Example                                       | Description                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [app-basic](examples/app-basic)               | Shows how to build a basic app plugin that uses custom routing                             |
| [app-with-backend](examples/app-with-backend) | Shows how to build a basic app plugin that uses custom routing and has a backend component |

## Panel plugins

| Example                             | Description                                                                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [panel-basic](examples/panel-basic) | Shows how to build a panel plugin that uses the time series graph from `@grafana/ui` to read and update the dashboard time range. |

## Data source plugins

| Example                                                     | Description                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| [datasource-basic](examples/datasource-basic)               | Shows how to build a basic data source plugin.                             |
| [datasource-with-backend](examples/datasource-with-backend) | Shows how to build a basic data source plugin and has a backend component. |

> [!NOTE]
> The plugin examples in this repository use NPM to manage frontend dependencies. Whilst you are welcome to copy these examples and use Yarn or PNPM instead, we offer no support for them.

## Integration tests

Some of the examples in this repository contain integration tests that make use of [`@grafana/plugin-e2e`](https://npmjs.com/package/@grafana/plugin-e2e) package. These tests can be run individually by navigating to the example plugin and running one of the following commands:

- `npm run e2e` - run Playwright e2e tests

### Testing against latest versions of Grafana

The GitHub workflow `.github/workflows/integration-tests.yml` finds all plugin examples identified by the existence of `src/plugin.json`. For every example plugin, build scripts will be run to confirm the plugins can be built against intended and canary NPM packages. Any example plugin that has a playwright.config.ts file will run the following:

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
    permissions:
      # Required permissions when comment-pr is set to 'yes': pull-requests: write, contents: read
      pull-requests: write
      contents: read
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - name: Install dependencies
        run: npm install
      - name: Build plugin
        run: npm run build
      - name: Compatibility check
        uses: grafana/plugin-actions/is-compatible@main
        with:
          module: "./src/module.ts"
          comment-pr: "yes"
          fail-if-incompatible: "no"
```

This runs a compatibility check for the latest release of Grafana plugins API in your project every time a new push or pull request is open. If it finds an error you will see a message indicating you have an incompatibility.

Sometimes incompatibilities are minor. For example, a type changed but this doesn't affect your plugin. We recommend that you upgrade your Grafana dependencies if this is the case so you always use the latest API.
