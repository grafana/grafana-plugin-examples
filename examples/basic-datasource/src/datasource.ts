import { DataSourceInstanceSettings, SelectableValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { BasicQuery, BasicDataSourceOptions, ScenarioResponse } from './types';

export class BasicDataSource extends DataSourceWithBackend<BasicQuery, BasicDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<BasicDataSourceOptions>) {
    super(instanceSettings);
  }

  async getScenarios(): Promise<Array<SelectableValue<string>>> {
    console.log('response');
    const response: ScenarioResponse = await this.getResource('/scenarios');
    return response.scenarios.map((scenario) => ({
      label: scenario,
      value: scenario,
    }));
  }
}
