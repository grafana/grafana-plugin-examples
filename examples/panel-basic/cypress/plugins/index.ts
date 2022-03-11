import { initPlugin } from 'cypress-plugin-snapshots/plugin';

export default (on, config) => {
  initPlugin(on, config);
  return config;
};
