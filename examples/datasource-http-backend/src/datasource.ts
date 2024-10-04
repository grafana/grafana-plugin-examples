import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';
import { DataSourceWithBackend, MigrationHandler } from '@grafana/runtime';
import { DataQuery } from '@grafana/schema';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> implements MigrationHandler {
  hasBackendMigration: boolean;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.hasBackendMigration = true;
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return { multiply: 1 };
  }

  filterQuery(query: MyQuery): boolean {
    return true;
  }

  shouldMigrate(query: DataQuery): boolean {
    if ('multiply' in query) {
      return false;
    }
    return true;
  }
}
