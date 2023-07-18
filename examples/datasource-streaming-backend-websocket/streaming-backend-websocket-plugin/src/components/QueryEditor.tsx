import React from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import { handlerFactory } from './handleEvent';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const handleEvent = handlerFactory(query, onChange);

  const { upperLimit, lowerLimit } = query;

  return (
    <div className="gf-form">
      <InlineField label="Lower Limit" labelWidth={16} tooltip="Random numbers lower limit">
        <Input onChange={handleEvent('lowerLimit')} onBlur={onRunQuery} value={lowerLimit || ''} />
      </InlineField>
      <InlineField label="Upper Limit" labelWidth={16} tooltip="Random numbers upper limit">
        <Input onChange={handleEvent('upperLimit')} onBlur={onRunQuery} value={upperLimit || ''} />
      </InlineField>
    </div>
  );
}
