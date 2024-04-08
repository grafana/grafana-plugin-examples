import React, { ReactElement } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import type { EditorProps } from './types';
import { useChangeOptions } from './useChangeOptions';
import { useChangeSecureOptions } from './useChangeSecureOptions';
import { useResetSecureOptions } from './useResetSecureOptions';

export function ConfigEditor(props: EditorProps): ReactElement {
  const { jsonData, secureJsonData, secureJsonFields } = props.options;
  const onTimeFieldChange = useChangeOptions(props, 'defaultTimeField');
  const onPathFieldChange = useChangeOptions(props, 'path');
  const onApiKeyChange = useChangeSecureOptions(props, 'apiKey');
  const onResetApiKey = useResetSecureOptions(props, 'apiKey');

  return (
    <>
      <InlineField label="Path" labelWidth={14} interactive tooltip={'Json field returned to frontend'}>
        <Input
          id="config-editor-path"
          onChange={onPathFieldChange}
          value={jsonData.path}
          placeholder="Enter the path, e.g. /api/v1"
          width={40}
        />
      </InlineField>
      <InlineField
        label="Time Field"
        labelWidth={14}
        interactive
        tooltip="Default time field used when interpolate the $__timeFilter()"
      >
        <Input onChange={onTimeFieldChange} placeholder="time" value={jsonData?.defaultTimeField ?? ''} width={40} />
      </InlineField>
      <InlineField label="API Key" labelWidth={14} interactive tooltip={'Secure json field (backend only)'}>
        <SecretInput
          required
          id="config-editor-api-key"
          isConfigured={secureJsonFields.apiKey}
          value={secureJsonData?.apiKey}
          placeholder="Enter your API key"
          width={40}
          onReset={onResetApiKey}
          onChange={onApiKeyChange}
        />
      </InlineField>
    </>
  );
}
