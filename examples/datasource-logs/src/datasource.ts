import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  DataFrameType,
  QueryFixAction,
  DataSourceWithLogsContextSupport,
  LogRowContextOptions,
  LogRowModel,
  LogRowContextQueryDirection,
  rangeUtil,
  dateTime,
  CoreApp,
  DataQueryError,
  LoadingState,
  DataFrame,
  createDataFrame,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, DEFAULT_QUERY } from './types';
import { fetchLogs, Log } from './mockDataRequest';
import { catchError, forkJoin, from, interval, lastValueFrom } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export class MyDataSource
  extends DataSourceApi<MyQuery, MyDataSourceOptions>
  implements DataSourceWithLogsContextSupport<MyQuery>
{
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return DEFAULT_QUERY;
  }

  query(request: DataQueryRequest<MyQuery>): any {
    const { range, targets, liveStreaming } = request;

    // Process live streaming request
    if (liveStreaming) {
      // To simplify this, we only support one target in live streaming mode
      const query = targets[0];
      return interval(1000).pipe(
        mergeMap((i) => {
          const addedTime = i * 10000;
          return from(
            fetchLogs(query.limit, range!.from.valueOf() + addedTime, range!.to.valueOf() + addedTime, query.queryText)
          ).pipe(
            map((logs: Log[]) => {
              return { data: [this.processLogsToDataFrames(logs, query)], state: LoadingState.Streaming };
            })
          );
        })
      );
    }

    // Process regular log request
    const fetchLogsObservables = targets.map((query) => {
      return from(fetchLogs(query.limit, range!.from.valueOf(), range!.to.valueOf(), query.queryText)).pipe(
        map((logs: Log[]) => {
          return { data: [this.processLogsToDataFrames(logs, query)], state: LoadingState.Done };
        })
      );
    });

    if (fetchLogsObservables.length === 1) {
      return fetchLogsObservables[0];
    }

    return forkJoin(fetchLogsObservables).pipe(
      map((results: DataQueryResponse[]) => {
        const data: DataFrame[] = [];
        for (const result of results) {
          for (const frame of result.data) {
            data.push(frame);
          }
        }
        return { state: LoadingState.Done, data };
      })
    );
  }

  // With modifyQuery, users can use log details to adjust the query
  modifyQuery(query: MyQuery, action: QueryFixAction): MyQuery {
    let queryText = query.queryText ?? '';
    switch (action.type) {
      case 'ADD_FILTER':
        if (action.options?.key && action.options?.value) {
          queryText = `${queryText} ${action.options?.key}=${action.options.value}`;
        }
        break;
      case 'ADD_FILTER_OUT':
        {
          if (action.options?.key && action.options?.value) {
            queryText = `${queryText} ${action.options?.key}!=${action.options.value}`;
          }
        }
        break;
    }
    return { ...query, queryText };
  }

  async getLogRowContextQuery(row: LogRowModel, options?: LogRowContextOptions, query?: MyQuery) {
    if (query) {
      // Create a new query for the log context
      const contextQuery = { ...query, queryText: `${query.queryText} log-context + ${row.uid}` };
      return Promise.resolve(contextQuery);
    }

    return Promise.resolve(null);
  }

  async getLogRowContext(
    row: LogRowModel,
    options?: LogRowContextOptions,
    query?: MyQuery
  ): Promise<DataQueryResponse> {
    const lookBack = 6 * 60 * 60 * 1000; // 6 hours
    const timeRange = {
      from:
        options?.direction === LogRowContextQueryDirection.Forward
          ? dateTime(row.timeEpochMs - lookBack)
          : dateTime(row.timeEpochMs),
      to:
        options?.direction === LogRowContextQueryDirection.Forward
          ? dateTime(row.timeEpochMs)
          : dateTime(row.timeEpochMs + lookBack),
    };

    const contextQuery = await this.getLogRowContextQuery(row, options, query);

    const range = {
      ...timeRange,
      raw: timeRange,
    };

    const intervalInfo = rangeUtil.calculateInterval(range, 1);
    const request = {
      targets: contextQuery ? [contextQuery] : [],
      requestId: `context-${query?.refId}`,
      interval: intervalInfo.interval,
      intervalMs: intervalInfo.intervalMs,
      range,
      scopedVars: {},
      timezone: 'UTC',
      app: CoreApp.Explore,
      startTime: Date.now(),
      hideFromInspector: true,
    };

    // Execute log context query
    return lastValueFrom(
      this.query(request).pipe(
        catchError((err) => {
          const error: DataQueryError = {
            message: 'Error during context query. Please check JS console logs.',
            status: err.status,
            statusText: err.statusText,
          };
          throw error;
        })
      )
    );
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }

  private processLogsToDataFrames(logs: Log[], target: MyQuery) {
    const timeStampValues: number[] = [];
    const bodyValues: string[] = [];
    const severityValues: string[] = [];
    const idValues: string[] = [];
    const labelsValues: object[] = [];
    logs.forEach((log) => {
      const { timestamp, body, severity, id, ...rest } = log;
      timeStampValues.push(timestamp);
      bodyValues.push(body);
      severityValues.push(severity);
      idValues.push(id);
      labelsValues.push(rest);
    });

    const dataFrame = createDataFrame({
      refId: target.refId,
      fields: [
        { name: 'timestamp', type: FieldType.time, values: timeStampValues },
        { name: 'body', type: FieldType.string, values: bodyValues },
        { name: 'severity', type: FieldType.string, values: severityValues },
        { name: 'id', type: FieldType.string, values: idValues },
        { name: 'labels', type: FieldType.other, values: labelsValues },
      ],
      meta: {
        type: DataFrameType.LogLines,
        preferredVisualisationType: 'logs',
        custom: {
          limit: target.limit,
          //error: "test error message",
          searchWords: [target.queryText],
        },
      },
    });
    return dataFrame;
  }
}
