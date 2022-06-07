import { Configuration, container } from 'webpack';
import { mergeWithCustomize, customizeArray, customizeObject } from 'webpack-merge';
import snakeCase from 'lodash/snakeCase';
import grafanaConfig from './.config/webpack/webpack.config';

const pluginPackageDeets = require('./package.json');
const deps = pluginPackageDeets.dependencies;
const pluginName = pluginPackageDeets.name;

const config = (env) =>
  mergeWithCustomize({
    customizeArray: customizeArray({
      plugins: 'prepend',
    }),
    customizeObject: customizeObject({
      entry: 'replace',
    }),
  })(grafanaConfig(env), {
    entry: {
      plugin: './plugin.ts',
    },
    output: {
      publicPath: `/public/plugins/${pluginName}/`,
    },
    plugins: [
      new container.ModuleFederationPlugin({
        name: snakeCase(pluginName),
        filename: 'module.js',
        remotes: {},
        exposes: {
          './plugin': './plugin.ts',
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          '@grafana/ui': {
            requiredVersion: '^9.0.0',
          },
        },
      }),
    ],
  } as Configuration);

export default config;
