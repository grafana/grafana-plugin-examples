import React from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import { handlerFactory } from './handleEvent';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const handleEvent = handlerFactory(query, onChange);

  const { upperLimit, lowerLimit, tickInterval } = query;

  return (
    <div className="gf-form">
      <InlineField label="Lower Limit" labelWidth={16} tooltip="Random numbers lower limit">
        <Input onChange={handleEvent('lowerLimit', parseFloat)} onBlur={onRunQuery} value={lowerLimit || ''} />
      </InlineField>
      <InlineField label="Upper Limit" labelWidth={16} tooltip="Random numbers upper limit">
        <Input onChange={handleEvent('upperLimit', parseFloat)} onBlur={onRunQuery} value={upperLimit || ''} />
      </InlineField>
      <InlineField label="Tick interval" labelWidth={16} tooltip="Server tick interval">
        <Input onChange={handleEvent('tickInterval', parseFloat)} onBlur={onRunQuery} value={tickInterval || ''} />
      </InlineField>
    </div>
  );
}
