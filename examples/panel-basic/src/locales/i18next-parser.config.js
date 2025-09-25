const pluginJson = require('../plugin.json');

module.exports = {
  locales: ['en-US', 'es-ES', 'sv-SE'], // An array of the locales your plugin supports
  sort: true,
  createOldCatalogs: false,
  failOnWarnings: true,
  verbose: false,
  resetDefaultValueLocale: 'en-US', // Updates extracted values when they change in code
  defaultNamespace: pluginJson.id,
  input: ['../**/*.{tsx,ts}'],
  output: 'src/locales/$LOCALE/$NAMESPACE.json',
};
