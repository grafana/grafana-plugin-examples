import { NavModelItem } from '@grafana/data';
import pluginJson from './plugin.json';

export const PLUGIN_ID = `${pluginJson.id}`
export const PLUGIN_BASE_URL = `/a/${PLUGIN_ID}`;

export enum ROUTES {
  One = 'one',
  Config = 'config'
}

export const NAVIGATION_TITLE = 'Grafana App with Backend';
export const NAVIGATION_SUBTITLE = 'So you can have a pretty widget in the front, with fancy stuff in the back';

// Add a navigation item for each route you would like to display in the navigation bar
export const NAVIGATION: Record<string, NavModelItem> = {
  [ROUTES.One]: {
    id: ROUTES.One,
    text: 'Page One',
    icon: 'database',
    url: `${PLUGIN_BASE_URL}/one`,
  },
  [ROUTES.Config]: {
    id: ROUTES.Config,
    text: 'Configuration',
    icon: 'cog',
    url: `plugins/${PLUGIN_ID}`
  }
};
