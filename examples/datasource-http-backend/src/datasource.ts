import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';
import { DataSourceWithBackend } from '@grafana/runtime';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return { multiply: 1 };
  }

  async postMigrateQuery(query: MyQuery): Promise<MyQuery> {
    if ('multiply' in query) {
      return query;
    }
    return super.postMigrateQuery(query);
  }
}
