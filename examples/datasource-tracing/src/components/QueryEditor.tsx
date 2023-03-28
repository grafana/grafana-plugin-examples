import React, { ChangeEvent } from 'react';
import { InlineField, Input, Checkbox } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, constant: parseFloat(event.target.value) });
    // executes the query
    onRunQuery();
  };

  const onSlowChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, slow: event.currentTarget.checked });
    onRunQuery();
  };

  const { queryText, constant, slow } = query;

  return (
    <div className="gf-form">
      <InlineField label="Constant">
        <Input onChange={onConstantChange} value={constant} width={8} type="number" step="0.1" />
      </InlineField>
      <InlineField label="Query Text" labelWidth={16} tooltip="Not used yet">
        <Input onChange={onQueryTextChange} value={queryText || ''} />
      </InlineField>
      <InlineField label="Slow">
        <Checkbox onChange={onSlowChange} value={slow} type="checkbox" />
      </InlineField>
    </div>
  );
}
