import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import type { DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import type { BasicQuery, BasicDataSourceOptions, QueryTypesResponse } from './types';

export class BasicDataSource extends DataSourceWithBackend<BasicQuery, BasicDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<BasicDataSourceOptions>) {
    super(instanceSettings);
  }

  applyTemplateVariables(query: BasicQuery, scopedVars: ScopedVars) {
    return {
      ...query,
      rawQuery: getTemplateSrv().replace(query.rawQuery, scopedVars),
    };
  }

  filterQuery(query: BasicQuery): boolean {
    return !!query.rawQuery;
  }

  getAvailableQueryTypes(): Promise<QueryTypesResponse> {
    return this.getResource('/query-types');
  }
}
