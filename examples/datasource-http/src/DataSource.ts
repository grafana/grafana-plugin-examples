import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';
import { getBackendSrv, isFetchError } from '@grafana/runtime';
import _ from 'lodash';
import defaults from 'lodash/defaults';
import { DataSourceResponse, defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { lastValueFrom } from 'rxjs';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.baseUrl = instanceSettings.url!;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (target) => {
      const query = defaults(target, defaultQuery);
      const response = await this.request('/api/metrics', `query=${query.queryText}`);

      /**
       * In this example, the /api/metrics endpoint returns:
       *
       * {
       *   "datapoints": [
       *     {
       *       Time: 1234567891011,
       *       Value: 12.5
       *     },
       *     {
       *     ...
       *   ]
       * }
       */
      const datapoints = response.data.datapoints;

      const timestamps: number[] = [];
      const values: number[] = [];

      for (let i = 0; i < datapoints.length; i++) {
        timestamps.push(datapoints[i].Time);
        values.push(datapoints[i].Value);
      }

      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', type: FieldType.time, values: timestamps },
          { name: 'Value', type: FieldType.number, values: values },
        ],
      });
    });

    return Promise.all(promises).then((data) => ({ data }));
  }

  async request(url: string, params?: string) {
    const response = getBackendSrv().fetch<DataSourceResponse>({
      url: `${this.baseUrl}${url}${params?.length ? `?${params}` : ''}`,
    });
    return lastValueFrom(response);
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const defaultErrorMessage = 'Cannot connect to API';

    try {
      const response = await this.request('/healthz');
      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Success',
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      let message = '';
      if (_.isString(err)) {
        message = err;
      } else if (isFetchError(err)) {
        message += err.statusText ? err.statusText : defaultErrorMessage;
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }
      }
      return {
        status: 'error',
        message,
      };
    }
  }
}
