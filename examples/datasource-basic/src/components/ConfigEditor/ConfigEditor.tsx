import React, { ReactElement } from 'react';
import { FieldSet, InlineField, Input, LegacyForms } from '@grafana/ui';
import type { EditorProps } from './types';
import { useChangeOptions } from './useChangeOptions';
import { useChangeSecureOptions } from './useChangeSecureOptions';
import { useResetSecureOptions } from './useResetSecureOptions';

const { SecretFormField } = LegacyForms;

export function ConfigEditor(props: EditorProps): ReactElement {
  const { jsonData, secureJsonData } = props.options;
  const onTimeFieldChange = useChangeOptions(props, 'defaultTimeField');
  const onApiKeyChange = useChangeSecureOptions(props, 'apiKey');
  const onResetApiKey = useResetSecureOptions(props, 'apiKey');

  return (
    <>
      <FieldSet label="General">
        <InlineField label="Time Field" tooltip="Default time field used when interpolate the $__timeFilter()">
          <Input onChange={onTimeFieldChange} placeholder="time" value={jsonData?.defaultTimeField ?? ''} />
        </InlineField>
      </FieldSet>

      <FieldSet label="API Settings">
        <SecretFormField
          tooltip="API Key used to make calls to your data source"
          isConfigured={Boolean(secureJsonData?.apiKey)}
          value={secureJsonData?.apiKey || ''}
          label="API Key"
          placeholder="secure json field (backend only)"
          labelWidth={6}
          inputWidth={20}
          onReset={onResetApiKey}
          onChange={onApiKeyChange}
        />
      </FieldSet>
    </>
  );
}
