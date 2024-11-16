import type { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  queryText: string;
  limit: number;
}

export interface MyDataSourceOptions {}

export interface DataSourceResponse {
  datapoints: string[];
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  queryText: '',
  // default limit is 100
  limit: 100,
};
