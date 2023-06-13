import React from 'react';
import { AppPluginMeta, PluginConfigPageProps } from '@grafana/data';
import { testIds } from '../testIds';

export type AppPluginSettings = {
  apiUrl?: string;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> {}

export const AppConfig = ({ plugin }: AppConfigProps) => {
  const { enabled, pinned } = plugin.meta;

  return (
    <div data-testid={testIds.appConfig.container}>
      {enabled && <>Plugin enabled</>}
      {pinned && <>Plugin pinned</>}
    </div>
  );
};
