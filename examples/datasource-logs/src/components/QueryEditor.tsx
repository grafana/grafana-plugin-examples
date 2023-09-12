import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { MyDataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<MyDataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange }: Props) {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onQueryLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, limit: parseInt(event.target.value,10) });
  };

  return (
    <div className="gf-form">
      <InlineField label="Query" labelWidth={20} tooltip="Query text">
        <Input onChange={onQueryTextChange} value={query.queryText || ''} width={70}/>
      </InlineField>
      <InlineField label="Log limit" labelWidth={20} tooltip="Log limit">
        <Input onChange={onQueryLimitChange} value={query.limit || 100} width={20} type='number'/>
      </InlineField>

    </div>
  );
}
