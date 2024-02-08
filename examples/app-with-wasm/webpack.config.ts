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
