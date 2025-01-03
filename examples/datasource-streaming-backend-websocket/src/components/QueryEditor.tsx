import React, { ChangeEvent } from 'react';
import { InlineField, Input, HorizontalGroup } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onLowerLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, lowerLimit: event.target.valueAsNumber });
  };

  const onUpperLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, upperLimit: event.target.valueAsNumber });
  };

  const { upperLimit, lowerLimit } = query;

  return (
    <HorizontalGroup>
      <InlineField label="Lower Limit" labelWidth={16} tooltip="Random numbers lower limit">
        <Input
          data-testid="lower-limit"
          onChange={onLowerLimitChange}
          onBlur={onRunQuery}
          value={lowerLimit || ''}
          type="number"
        />
      </InlineField>
      <InlineField label="Upper Limit" labelWidth={16} tooltip="Random numbers upper limit">
        <Input
          data-testid="upper-limit"
          onChange={onUpperLimitChange}
          onBlur={onRunQuery}
          value={upperLimit || ''}
          type="number"
        />
      </InlineField>
    </HorizontalGroup>
  );
}
