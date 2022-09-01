import fs from 'fs';
import path from 'path';
import { SOURCE_DIR } from './constants';

export function getPackageJson() {
  return require(path.resolve(process.cwd(), 'package.json'));
}

export function getPluginId() {
  const { id } = require(path.resolve(process.cwd(), `${SOURCE_DIR}/plugin.json`));

  return id;
}

export function hasReadme() {
  return fs.existsSync(path.resolve(process.cwd(), SOURCE_DIR, 'README.md'));
}
