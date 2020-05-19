import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  CircularDataFrame,
  FieldType,
} from '@grafana/data';

import { Observable, merge } from 'rxjs';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  serverURL?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.serverURL = instanceSettings.jsonData.url || 'ws://localhost:8080';
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const observables = options.targets.map(target => {
      const query = defaults(target, defaultQuery);

      return new Observable<DataQueryResponse>(subscriber => {
        const frame = new CircularDataFrame({
          append: 'tail',
          capacity: 1000,
        });

        frame.refId = query.refId;
        frame.addField({ name: 'time', type: FieldType.time });
        frame.addField({ name: 'value', type: FieldType.number });

        const connection = new WebSocket(this.serverURL || '');

        connection.onerror = (error: any) => {
          console.log(`WebSocket error: ${JSON.stringify(error)}`);
        };

        connection.onmessage = (event: any) => {
          const { time, value } = JSON.parse(event.data);
          frame.add({ time, value });

          subscriber.next({
            data: [frame],
            key: query.refId,
          });
        };
      });
    });

    return merge(...observables);
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
