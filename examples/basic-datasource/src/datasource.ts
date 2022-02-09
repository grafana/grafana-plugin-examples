import { DataSourceWithBackend } from '@grafana/runtime';
import type { DataSourceInstanceSettings } from '@grafana/data';
import type { BasicQuery, BasicDataSourceOptions, QueryTypesResponse } from './types';

export class BasicDataSource extends DataSourceWithBackend<BasicQuery, BasicDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<BasicDataSourceOptions>) {
    super(instanceSettings);
  }

  getAvailableQueryTypes(): Promise<QueryTypesResponse> {
    return this.getResource('/query-types');
  }
}
