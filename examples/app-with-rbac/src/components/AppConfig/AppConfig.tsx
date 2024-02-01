import React from 'react';
import { AppPluginMeta, PluginConfigPageProps } from '@grafana/data';

export type AppPluginSettings = {
  apiUrl?: string;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> {}

export const AppConfig = ({ plugin }: AppConfigProps) => {
  return <div>No config required for this plugin.</div>;
};
