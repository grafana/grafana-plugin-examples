/*
 * ⚠️⚠️⚠️ THIS FILE WAS SCAFFOLDED BY `@grafana/create-plugin`. DO NOT EDIT THIS FILE DIRECTLY. ⚠️⚠️⚠️
 *
 * In order to extend the configuration follow the steps in
 * https://grafana.com/developers/plugin-tools/get-started/set-up-development-environment#extend-the-webpack-config
 */

import CopyWebpackPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';
import path from 'path';
import ReplaceInFileWebpackPlugin from 'replace-in-file-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { type Configuration, BannerPlugin } from 'webpack';

import { getPackageJson, getPluginJson, hasReadme, getEntries, isWSL, getCPConfigVersion } from './utils';
import { SOURCE_DIR, DIST_DIR } from './constants';

const pluginJson = getPluginJson();
const cpVersion = getCPConfigVersion();

const config = async (env): Promise<Configuration> => {
  const baseConfig: Configuration = {
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },

    context: path.join(process.cwd(), SOURCE_DIR),

    devtool: env.production ? 'source-map' : 'eval-source-map',

    entry: await getEntries(),

    externals: [
      // Required for dynamic publicPath resolution
      { 'amd-module': 'module' },
      'lodash',
      'jquery',
      'moment',
      'slate',
      'emotion',
      '@emotion/react',
      '@emotion/css',
      'prismjs',
      'slate-plain-serializer',
      '@grafana/slate-react',
      'react',
      'react-dom',
      'react-redux',
      'redux',
      'rxjs',
      'react-router',
      'react-router-dom',
      'd3',
      'angular',
      '@grafana/ui',
      '@grafana/runtime',
      '@grafana/data',

      // Mark legacy SDK imports as external if their name starts with the "grafana/" prefix
      ({ request }, callback) => {
        const prefix = 'grafana/';
        const hasPrefix = (request) => request.indexOf(prefix) === 0;
        const stripPrefix = (request) => request.substr(prefix.length);

        if (hasPrefix(request)) {
          return callback(undefined, stripPrefix(request));
        }

        callback();
      },
    ],

    // Support WebAssembly according to latest spec - makes WebAssembly module async
    experiments: {
      asyncWebAssembly: true,
    },

    mode: env.production ? 'production' : 'development',

    module: {
      rules: [
        {
          exclude: /(node_modules)/,
          test: /\.[tj]sx?$/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                baseUrl: path.resolve(process.cwd(), SOURCE_DIR),
                target: 'es2015',
                loose: false,
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: false,
                  dynamicImport: true,
                },
              },
            },
          },
        },
        {
          test: /src\/(?:.*\/)?module\.tsx?$/,
          use: [
            {
              loader: 'imports-loader',
              options: {
                imports: `side-effects ${path.join(__dirname, 'publicPath.ts')}`,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: Boolean(env.production) ? '[hash][ext]' : '[file]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          generator: {
            filename: Boolean(env.production) ? '[hash][ext]' : '[file]',
          },
        },
      ],
    },

    optimization: {
      minimize: Boolean(env.production),
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: (_, { type, value }) => type === 'comment2' && value.trim().startsWith('[create-plugin]'),
            },
          },
        }),
      ],
    },

    output: {
      clean: {
        keep: new RegExp(`(.*?_(amd64|arm(64)?)(.exe)?|go_plugin_build_manifest)`),
      },
      filename: '[name].js',
      library: {
        type: 'amd',
      },
      path: path.resolve(process.cwd(), DIST_DIR),
      publicPath: `public/plugins/${pluginJson.id}/`,
      uniqueName: pluginJson.id,
    },

    plugins: [
      // Insert create plugin version information into the bundle
      new BannerPlugin({
        banner: '/* [create-plugin] version: ' + cpVersion + ' */',
        raw: true,
        entryOnly: true,
      }),
      new CopyWebpackPlugin({
        patterns: [
          // If src/README.md exists use it; otherwise the root README
          // To `compiler.options.output`
          { from: hasReadme() ? 'README.md' : '../README.md', to: '.', force: true },
          { from: 'plugin.json', to: '.' },
          { from: '../LICENSE', to: '.' },
          { from: '../CHANGELOG.md', to: '.', force: true },
          { from: '**/*.json', to: '.' }, // TODO<Add an error for checking the basic structure of the repo>
          { from: '**/*.svg', to: '.', noErrorOnMissing: true }, // Optional
          { from: '**/*.png', to: '.', noErrorOnMissing: true }, // Optional
          { from: '**/*.html', to: '.', noErrorOnMissing: true }, // Optional
          { from: 'img/**/*', to: '.', noErrorOnMissing: true }, // Optional
          { from: 'libs/**/*', to: '.', noErrorOnMissing: true }, // Optional
          { from: 'static/**/*', to: '.', noErrorOnMissing: true }, // Optional
          { from: '**/query_help.md', to: '.', noErrorOnMissing: true }, // Optional
        ],
      }),
      // Replace certain template-variables in the README and plugin.json
      new ReplaceInFileWebpackPlugin([
        {
          dir: DIST_DIR,
          files: ['plugin.json', 'README.md'],
          rules: [
            {
              search: /\%VERSION\%/g,
              replace: getPackageJson().version,
            },
            {
              search: /\%TODAY\%/g,
              replace: new Date().toISOString().substring(0, 10),
            },
            {
              search: /\%PLUGIN_ID\%/g,
              replace: pluginJson.id,
            },
          ],
        },
      ]),
      ...(env.development
        ? [
            new LiveReloadPlugin(),
            new ForkTsCheckerWebpackPlugin({
              async: Boolean(env.development),
              issue: {
                include: [{ file: '**/*.{ts,tsx}' }],
              },
              typescript: { configFile: path.join(process.cwd(), 'tsconfig.json') },
            }),
            new ESLintPlugin({
              extensions: ['.ts', '.tsx'],
              lintDirtyModulesOnly: Boolean(env.development), // don't lint on start, only lint changed files
            }),
          ]
        : []),
    ],

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // handle resolving "rootDir" paths
      modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
      unsafeCache: true,
    },
  };

  if (isWSL()) {
    baseConfig.watchOptions = {
      poll: 3000,
      ignored: /node_modules/,
    };
  }

  return baseConfig;
};

export default config;
