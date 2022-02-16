const fs = require('fs');
const path = require('path');
const { SOURCE_DIR } = require('./constants');

module.exports = {
  getPackageJson,
  getPluginId,
  hasReadme,
};

function getPackageJson() {
  return require(path.resolve(process.cwd(), 'package.json'));
}

function getPluginId() {
  const { id } = require(path.resolve(process.cwd(), `${SOURCE_DIR}/plugin.json`));

  return id;
}

function hasReadme() {
  return fs.existsSync(path.resolve(process.cwd(), SOURCE_DIR, 'README.md'));
}
