import type { DataSourceJsonData } from '@grafana/data';
import type { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  upperLimit: number;
  lowerLimit: number;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  upperLimit: 1,
  lowerLimit: 0,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  uri?: string;
}
