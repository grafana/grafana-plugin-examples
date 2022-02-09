import { DataSourcePlugin } from '@grafana/data';
import { BasicDataSource } from './datasource';
import type { BasicQuery, BasicDataSourceOptions } from './types';
import { ConfigEditor, QueryEditor } from './components';

export const plugin = new DataSourcePlugin<BasicDataSource, BasicQuery, BasicDataSourceOptions>(BasicDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
