import type { QueryEditorProps } from '@grafana/data';
import type { BasicDataSource } from 'datasource';
import type { BasicDataSourceOptions, BasicQuery } from '../../types';

export type EditorProps = QueryEditorProps<BasicDataSource, BasicQuery, BasicDataSourceOptions>;

export type ChangeOptions<T> = {
  propertyName: keyof T;
  runQuery: boolean;
};
