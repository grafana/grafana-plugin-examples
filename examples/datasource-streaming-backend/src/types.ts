import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  upperLimit?: number;
  lowerLimit?: number;
  tickInterval?: number;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  upperLimit: 1,
  lowerLimit: 0,
  tickInterval: 1000,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {}
