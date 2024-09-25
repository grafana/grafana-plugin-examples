import type { DataSourceJsonData } from '@grafana/data';
import type { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  multiplier: number;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export interface MyDataSourceOptions extends DataSourceJsonData {}
