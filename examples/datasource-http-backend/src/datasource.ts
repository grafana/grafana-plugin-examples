import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';

import { MyQuery, MyDataSourceOptions, MyQueryDeprecated } from './types';
import { DataSourceWithBackend } from '@grafana/runtime';
import { omit } from 'lodash';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return { multiply: 1 };
  }

  migrateQuery(query: MyQuery | MyQueryDeprecated): MyQuery {
    if (query.datasource?.apiVersion !== 'v0alpha1') {
      // Unkown version
      return query as MyQuery;
    }
    if ('multiply' in query) {
      return query;
    }
    if ('multiplier' in query) {
      const migrated: MyQuery = {
        ...query,
        multiply: query.multiplier,
      };
      return omit(migrated, 'multiplier');
    }
    throw new Error('Unknown query format');
  }
}
