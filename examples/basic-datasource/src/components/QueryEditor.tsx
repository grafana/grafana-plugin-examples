import React, { ReactElement, useCallback, useMemo } from 'react';
import { useAsync } from 'react-use';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { InlineFieldRow, InlineField, Select } from '@grafana/ui';
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

  const selected = useMemo(() => {
    if (!query.scenario && scenarios.length > 0) {
      return scenarios[0];
    }
    return {
      label: query.scenario,
      value: query.scenario,
    };
  }, [query.scenario, scenarios]);

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
    <InlineFieldRow>
      <InlineField label="Scenario">
        <Select
          defaultValue={true}
          options={scenarios}
          onChange={onChangeQuery}
          isLoading={loading}
          disabled={!!error}
          value={selected}
        />
      </InlineField>
    </InlineFieldRow>
  );
}
