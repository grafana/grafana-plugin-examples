import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {}

export interface MyDataSourceOptions extends DataSourceJsonData {}
