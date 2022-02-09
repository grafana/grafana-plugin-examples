import { DataSourcePlugin } from '@grafana/data';
import { BasicDataSource } from './datasource';
import { ConfigEditor, QueryEditor } from './components';
import { BasicQuery, BasicDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<BasicDataSource, BasicQuery, BasicDataSourceOptions>(BasicDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
