import { NavModelItem } from '@grafana/data';
import pluginJson from './plugin.json';


export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

export enum ROUTES {
  One = 'one',
  Two = 'two',
  Three = 'three',
  Four = 'four',
}

export const NAVIGATION_TITLE = 'Basic App Plugin';
export const NAVIGATION_SUBTITLE = 'Some extra description...';

// Add a navigation item for each route you would like to display in the navigation bar
export const NAVIGATION: Record<string, NavModelItem> = {
  [ROUTES.One]: {
    id: ROUTES.One,
    text: 'Page One',
    icon: 'database',
    url: `${PLUGIN_BASE_URL}/one`,
  },
  [ROUTES.Two]: {
    id: ROUTES.Two,
    text: 'Page Two',
    icon: 'key-skeleton-alt',
    url: `${PLUGIN_BASE_URL}/two`,
  },
  [ROUTES.Three]: {
    id: ROUTES.Three,
    text: 'Page Three',
    icon: 'chart-line',
    url: `${PLUGIN_BASE_URL}/three`,
  },
};
