import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';
import { DataSourceWithBackendMigration } from '@grafana/runtime';

export class DataSource extends DataSourceWithBackendMigration<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return { multiply: 1 };
  }

  filterQuery(query: MyQuery): boolean {
    return true;
  }

  migrateQuery(query: MyQuery): Promise<MyQuery> | MyQuery {
    if ('multiply' in query) {
      return query;
    }
    return super.migrateQuery(query);
  }
}
