import React, { ChangeEvent } from 'react';
import { Stack, InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { MyDataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<MyDataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange }: Props) {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onQueryLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, limit: parseInt(event.target.value, 10) });
  };

  return (
    <Stack gap={0}>
      <InlineField label="Query" labelWidth={20} tooltip="Query text">
        <Input
          data-testid="query-editor-query-text"
          onChange={onQueryTextChange}
          value={query.queryText || ''}
          width={70}
        />
      </InlineField>
      <InlineField label="Log limit" labelWidth={20} tooltip="Log limit">
        <Input
          data-testid="query-editor-log-limit"
          onChange={onQueryLimitChange}
          value={query.limit || 100}
          width={20}
          type="number"
        />
      </InlineField>
    </Stack>
  );
}
