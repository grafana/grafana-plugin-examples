import React from 'react';
import { FieldSet, InlineField, InlineFieldRow, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from '../types';
import { handlerFactory } from './handleEvent';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const {
    onOptionsChange,
    options,
    options: { jsonData },
  } = props;
  const handleChange = handlerFactory(options, onOptionsChange);

  const { uri } = jsonData;

  return (
    <div className="gf-form-group">
      <FieldSet label="Connection">
        <InlineFieldRow>
          <InlineField
            label="URI"
            labelWidth={10}
            tooltip="Supported schemes: WebSocket (ws://) or (wss://)"
          >
            <Input
              width={30}
              name="uri"
              required
              value={uri}
              autoComplete="off"
              placeholder="ws://websocket-server:8080"
              onChange={handleChange('jsonData.uri')}
            />
          </InlineField>
        </InlineFieldRow>
      </FieldSet>
    </div>
  );
}
