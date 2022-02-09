import { useAsync } from 'react-use';
import { SelectableValue } from '@grafana/data';
import { BasicDataSource } from '../../datasource';

type AsyncScenarioState = {
  loading: boolean;
  scenarios: Array<SelectableValue<string>>;
  error: Error | undefined;
};

export function useScenarios(datasource: BasicDataSource): AsyncScenarioState {
  const result = useAsync(async () => {
    const { scenarios } = await datasource.getScenarios();

    return scenarios.map((scenario) => ({
      label: scenario,
      value: scenario,
    }));
  }, [datasource]);

  return {
    loading: result.loading,
    scenarios: result.value ?? [],
    error: result.error,
  };
}
