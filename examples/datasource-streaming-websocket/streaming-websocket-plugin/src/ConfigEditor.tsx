import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InlineField, Input } from '@grafana/ui';
import React, { ChangeEvent, PureComponent } from 'react';
import { MyDataSourceOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      url: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData } = options;

    return (
      <InlineField label="URL" labelWidth={14} tooltip="Supported schemes: WebSocket (ws://) or (wss://)">
        <Input
          width={50}
          name="url"
          data-testid="uri-websocket-server"
          value={jsonData.url || ''}
          autoComplete="off"
          placeholder="ws://mockserver:8080"
          onChange={this.onURLChange}
        />
      </InlineField>
    );
  }
}
