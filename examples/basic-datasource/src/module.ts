import { DataSourcePlugin } from '@grafana/data';
import { BasicDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { BasicQuery as BasicQuery, BasicDataSourceOptions as BasicDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<BasicDataSource, BasicQuery, BasicDataSourceOptions>(BasicDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
