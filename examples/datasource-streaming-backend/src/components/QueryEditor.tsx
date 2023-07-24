import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onLowerLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, lowerLimit: event.target.valueAsNumber });
  };

  const onUpperLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, upperLimit: event.target.valueAsNumber });
  };

  const onTickIntervalChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, tickInterval: event.target.valueAsNumber });
  };

  const { upperLimit, lowerLimit, tickInterval } = query;

  return (
    <div className="gf-form">
      <InlineField label="Lower Limit" labelWidth={16} tooltip="Random numbers lower limit">
        <Input onChange={onLowerLimitChange} onBlur={onRunQuery} value={lowerLimit || ''} type="number" />
      </InlineField>
      <InlineField label="Upper Limit" labelWidth={16} tooltip="Random numbers upper limit">
        <Input onChange={onUpperLimitChange} onBlur={onRunQuery} value={upperLimit || ''} type="number" />
      </InlineField>
      <InlineField label="Tick interval" labelWidth={16} tooltip="Server tick interval">
        <Input onChange={onTickIntervalChange} onBlur={onRunQuery} value={tickInterval || ''} type="number" />
      </InlineField>
    </div>
  );
}
