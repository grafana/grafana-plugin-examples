import { DataQuery, DataSourceJsonData } from '@grafana/schema';

export interface MyQueryDeprecated extends DataQuery {
  // Old implementation
  multiplier: number;
}

export interface MyQuery extends DataQuery {
  // New
  multiply: number;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export interface MyDataSourceOptions extends DataSourceJsonData {}
