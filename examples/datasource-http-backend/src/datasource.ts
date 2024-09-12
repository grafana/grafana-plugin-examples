import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';
import { DataSourceWithBackend } from '@grafana/runtime';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return { multiply: 1, pluginVersion: this.meta.info.version };
  }

  async migrateQuery(query: any): Promise<MyQuery> {
    return await this.postResource<MyQuery>(`/migrate-query`, query);
  }
}
