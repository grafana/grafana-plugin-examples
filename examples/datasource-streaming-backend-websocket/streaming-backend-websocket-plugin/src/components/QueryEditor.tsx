import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onLowerLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, lowerLimit: event.target.value });
    // executes the query
    onRunQuery();
  };

  const onUpperLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, upperLimit: event.target.value });
    // executes the query
    onRunQuery();
  };

  const { upperLimit, lowerLimit } = query;

  return (
    <div className="gf-form">
      <InlineField label="Lower Limit" labelWidth={16} tooltip="Random numbers lower limit">
        <Input onChange={onLowerLimitChange} onBlur={onRunQuery} value={lowerLimit || ''} />
      </InlineField>
      <InlineField label="Upper Limit" labelWidth={16} tooltip="Random numbers upper limit">
        <Input onChange={onUpperLimitChange} onBlur={onRunQuery} value={upperLimit || ''} />
      </InlineField>
    </div>
  );
}
