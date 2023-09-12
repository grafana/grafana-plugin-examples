import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema'

export interface MyQuery extends DataQuery {
  queryText: string;
  limit: number;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  queryText: '',
  // default limit is 100
  limit: 100,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
