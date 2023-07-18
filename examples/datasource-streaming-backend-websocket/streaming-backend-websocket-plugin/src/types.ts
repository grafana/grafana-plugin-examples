import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  upperLimit?: number;
  lowerLimit?: number;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  upperLimit: 1.0,
  lowerLimit: 0.0,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  uri?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
