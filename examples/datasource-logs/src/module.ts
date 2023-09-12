import { DataSourcePlugin } from '@grafana/data';
import { MyDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

// @ts-ignore Does not seem to be a problem in the code, but rather in the types
export const plugin = new DataSourcePlugin<MyDataSource, MyQuery, MyDataSourceOptions>(MyDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
