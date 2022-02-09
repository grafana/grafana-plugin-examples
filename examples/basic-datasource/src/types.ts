import type { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface BasicQuery extends DataQuery {
  rawQuery: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface BasicDataSourceOptions extends DataSourceJsonData {
  defaultTimeField?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface BasicSecureJsonData {
  apiKey?: string;
}

export type QueryTypesResponse = {
  queryTypes: string[];
};
