import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';

import { MyQuery, MyDataSourceOptions, MyQueryDeprecated } from './types';
import { DataSourceWithBackend, getBackendSrv, config } from '@grafana/runtime';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return { multiply: 1 };
  }

  async migrateQuery(query: MyQuery | MyQueryDeprecated): Promise<MyQuery> {
    if ('multiply' in query) {
      return query;
    }
    const request = {
      queries: [
        {
          ...query,
          JSON: query, // JSON is not part of the type but it should what holds the query
        },
      ],
    };

    let url = '/api/ds/query/convert';
    if (config.featureToggles.grafanaAPIServerWithExperimentalAPIs) {
      url = `/apis/example-httpbackend.datasource.grafana.app/v0alpha1/namespaces/stack-1/connections/${this.uid}/query-convert`;
    }
    const response = await getBackendSrv().post(url, request);
    return response.queries[0];
  }
}
