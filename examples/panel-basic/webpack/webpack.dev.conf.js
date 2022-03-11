const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const { getPackageJson, getPluginId, hasReadme } = require('./utils');
const { SOURCE_DIR, DIST_DIR, ENTRY_FILE } = require('./constants');
module.exports = {
  mode: 'development',

  // Compile for browsers
  target: 'web',

  // The "root dir" for the source code
  context: path.join(process.cwd(), SOURCE_DIR),

  // Source map type
  devtool: 'source-map',

  entry: {
    module: path.resolve(process.cwd(), ENTRY_FILE),
  },

  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), DIST_DIR),
    libraryTarget: 'amd',
    publicPath: '/',
  },

  // Don't show hints (e.g. asset size is over 250kb)
  performance: { hints: false },

  // External packages
  // (these are going to be provided by the Grafana runtime)
  externals: [
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
    'react-router-dom',
    'd3',
    'angular',
    '@grafana/ui',
    '@grafana/runtime',
    '@grafana/data',

    // Mark packages as external in case their name starts with the "grafana/" prefix
    // @ts-ignore
    ({ request }, callback) => {
      const prefix = 'grafana/';
      const hasPrefix = (request) => request.indexOf(prefix) === 0;
      const stripPrefix = (request) => request.substr(prefix.length);

      if (hasPrefix(request)) {
        return callback(null, stripPrefix(request));
      }

      // @ts-ignore
      callback();
    },
  ],

  // Order modules and chunks by occurance
  optimization: { chunkIds: 'total-size', moduleIds: 'size' },

  plugins: [
    // Copy static files
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
            replace: getPluginId(),
          },
        ],
      },
    ]),

    // Move type checking and ESLint linting to separate processes
    new ForkTsCheckerWebpackPlugin({
      typescript: { configFile: path.join(process.cwd(), 'tsconfig.json') },
      issue: {
        include: [{ file: '**/*.{ts,tsx}' }],
      },
    }),
    // Add live reload functionality. Requires <script /> in index.html
    new LiveReloadPlugin(),
  ],

  resolve: {
    // Prefer resolving the .ts files first, then fall back to the rest
    extensions: ['.ts', '.tsx', '.js'],
    // Try resolving modules from the source directory first
    modules: [path.resolve(process.cwd(), SOURCE_DIR), 'node_modules'],
  },

  module: {
    rules: [
      // Typescript
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { modules: false }]],
              plugins: ['angularjs-annotate'],
              sourceMaps: true,
            },
          },
          {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
              transpileOnly: true,
            },
          },
        ],
        exclude: /(node_modules)/,
      },

      // Javascript
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { modules: false }]],
              plugins: ['angularjs-annotate'],
              sourceMaps: true,
            },
          },
        ],
        exclude: /(node_modules)/,
      },

      // Images
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: '/',
              name: '[path][name].[ext]',
            },
          },
        ],
      },

      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          // Keep publicPath relative for host.com/grafana/ deployments
          publicPath: `public/plugins/${getPluginId()}/fonts`,
          outputPath: 'fonts',
          name: '[name].[ext]',
        },
      },
    ],
  },
};
