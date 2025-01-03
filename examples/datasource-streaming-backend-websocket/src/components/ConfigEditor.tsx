import React, { ChangeEvent } from 'react';
import { FieldSet, InlineField, InlineFieldRow, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const {
    onOptionsChange,
    options,
    options: { jsonData },
  } = props;

  const onUriChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      uri: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const { uri } = jsonData;

  return (
    <FieldSet label="Connection">
      <InlineFieldRow>
        <InlineField label="URI" labelWidth={10} tooltip="Supported schemes: WebSocket (ws://) or (wss://)">
          <Input
            width={30}
            data-testid="uri-websocket-server"
            required
            value={uri}
            autoComplete="off"
            placeholder="ws://host.docker.internal:8080"
            onChange={onUriChange}
          />
        </InlineField>
      </InlineFieldRow>
    </FieldSet>
  );
}
