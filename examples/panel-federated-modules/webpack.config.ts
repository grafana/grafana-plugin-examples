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
      externals: 'replace',
    }),
    customizeObject: customizeObject({
      entry: 'replace',
    }),
  })(grafanaConfig(env), {
    entry: {
      plugin: './plugin.ts',
    },
    devtool: 'source-map',
    externals: [],
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
          '@emotion/css': { singleton: true, requiredVersion: deps['@emotion/css'] },
          '@emotion/react': { singleton: true, requiredVersion: deps['@emotion/react'] },
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          '@grafana/data': {
            requiredVersion: '^9.0.0',
          },
          '@grafana/e2e-selectors': {
            requiredVersion: '^9.0.0',
          },
          '@grafana/runtime': {
            requiredVersion: '^9.0.0',
          },
          '@grafana/schema': {
            requiredVersion: '^9.0.0',
          },
          '@grafana/ui': {
            requiredVersion: '^9.0.0',
          },
        },
      }),
    ],
    optimization: {
      moduleIds: 'named',
      chunkIds: 'named',
      minimize: false,
    },
    resolve: {
      fallback: {
        stream: false,
        tty: false,
        util: false,
        indexof: false,
      },
    },
  } as Configuration);

export default config;
