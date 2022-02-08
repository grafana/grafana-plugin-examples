import React, { ReactElement, useCallback } from 'react';
import { useAsync } from 'react-use';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { BasicDataSource } from '../datasource';
import { BasicDataSourceOptions, BasicQuery } from '../types';

type Props = QueryEditorProps<BasicDataSource, BasicQuery, BasicDataSourceOptions>;

export function QueryEditor({ datasource, onChange, onRunQuery, query }: Props): ReactElement {
  const {
    loading,
    value: scenarios = [],
    error,
  } = useAsync(async () => {
    const { scenarios } = await datasource.getScenarios();
    return scenarios.map((scenario) => ({
      label: scenario,
      value: scenario,
    }));
  }, [datasource]);

  const onChangeQuery = useCallback(
    (selectable: SelectableValue<string>) => {
      if (!selectable?.value) {
        return;
      }

      onChange({
        ...query,
        scenario: selectable.value,
      });
      onRunQuery();
    },
    [onChange, onRunQuery, query]
  );

  return (
    <div>
      <Select defaultValue={true} options={scenarios} onChange={onChangeQuery} isLoading={loading} disabled={!!error} />
    </div>
  );
}
