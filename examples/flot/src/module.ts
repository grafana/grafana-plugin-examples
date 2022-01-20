import { PanelPlugin } from '@grafana/data';
import { FlotOptions } from './types';
import { FlotPanel } from './FlotPanel';

export const plugin = new PanelPlugin<FlotOptions>(FlotPanel);
