import React from 'react';
import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export const ConfigEditor: React.FC<Props> = ({ onOptionsChange, options }) => {
  return (
    <DataSourceHttpSettings
      defaultUrl="https://api.example.com"
      dataSourceConfig={options}
      onChange={onOptionsChange}
    />
  );
};
