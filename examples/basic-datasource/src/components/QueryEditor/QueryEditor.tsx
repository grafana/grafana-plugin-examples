import React, { ReactElement } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineFieldRow, InlineField, Select } from '@grafana/ui';
import { BasicDataSource } from '../../datasource';
import { BasicDataSourceOptions, BasicQuery } from '../../types';
import { useScenarios } from './useScenarios';
import { useSelectedValue } from './useSelectedValue';
import { useChangeAndRunQuery } from './useChangeAndRunQuery';

type Props = QueryEditorProps<BasicDataSource, BasicQuery, BasicDataSourceOptions>;

export function QueryEditor(props: Props): ReactElement {
  const { datasource, query } = props;
  const { loading, scenarios, error } = useScenarios(datasource);
  const scenario = useSelectedValue(scenarios, query.scenario);
  const onChangeScenario = useChangeAndRunQuery(props, 'scenario');

  return (
    <InlineFieldRow>
      <InlineField label="Scenario">
        <Select
          defaultValue={true}
          options={scenarios}
          onChange={onChangeScenario}
          isLoading={loading}
          disabled={!!error}
          value={scenario}
        />
      </InlineField>
    </InlineFieldRow>
  );
}
