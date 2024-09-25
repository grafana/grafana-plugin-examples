import {
  CoreApp,
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  createDataFrame,
} from '@grafana/data';
import { getBackendSrv, isFetchError } from '@grafana/runtime';
import { DataSourceResponse, defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { lastValueFrom } from 'rxjs';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.baseUrl = instanceSettings.url!;
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return defaultQuery;
  }

  filterQuery(query: MyQuery): boolean {
    return !!query.queryText;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      const df: DataFrame = createDataFrame({        
        refId: target.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time, config: {} },
          { name: 'Value', values: [target.constant, target.constant], type: FieldType.number, config: {} },
        ],
      });
      return df;
    });

    return { data };
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
      const response = await this.request('/health');
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
      let message = defaultErrorMessage;
      if (typeof err === 'string') {
        message = err;
      } else if (isFetchError(err)) {
        message = `Fetch error: ${err.data.error?.message ?? err.statusText}`;
      }
      return {
        status: 'error',
        message,
      };
    }
  }
}
