# Grafana App plugin with WASM dependency example

This plugin is an example of how to use a WebAssembly (WASM) dependency in a Grafana plugin.

## Webpack configuration

Since webpack 5, WebAssembly is not enabled by default and must be enabled in plugin's webpack config.

This example shows how to do so using webpack's `asyncWebAssembly` experiment in `webpack.config.ts`:

```js
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';
import pluginJson from './src/plugin.json';

const config = async (env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);
  return merge(baseConfig, {
    // Add custom config here...
    experiments: {
      asyncWebAssembly: true,
    },
    output: {
      publicPath: `public/plugins/${pluginJson.id}/`,
    },
  });
};

export default config;
```

Note that the scripts in `package.json` must also be updated to point to the custom webpack config file:

```json
{
  "scripts": {
    "build": "webpack -c ./webpack.config.ts --env production",
    "dev": "webpack -w -c ./webpack.config.ts --env development"
  }
}
```

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Grafana Synthetic Monitoring App](https://github.com/grafana/synthetic-monitoring-app)
- [Plugin.json documentation](https://grafana.com/developers/plugin-tools/reference-plugin-json)
- [Sign a plugin](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin)
