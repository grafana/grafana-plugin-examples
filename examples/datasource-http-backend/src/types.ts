import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  multiplier: number;
}

export interface MyDataSourceOptions extends DataSourceJsonData {}
