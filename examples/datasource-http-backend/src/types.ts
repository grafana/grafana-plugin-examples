import { DataQuery, DataSourceJsonData } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  multiply: number;
  pluginVersion: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export interface MyDataSourceOptions extends DataSourceJsonData {}
