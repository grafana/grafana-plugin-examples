import React, { ReactElement } from 'react';
import { Field, FieldSet, Input, LegacyForms } from '@grafana/ui';
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
        <Field label="Time Field" description="Default time field used when interpolate the $__timeFilter()">
          <Input onChange={onTimeFieldChange} placeholder="time" value={jsonData?.defaultTimeField ?? ''} />
        </Field>
      </FieldSet>

      <FieldSet label="Secrets">
        <Field label="API Key" description="API Key used to make calls to your data source">
          <SecretFormField
            isConfigured={Boolean(secureJsonData?.apiKey)}
            value={secureJsonData?.apiKey || ''}
            label="API Key"
            placeholder="secure json field (backend only)"
            labelWidth={6}
            inputWidth={20}
            onReset={onResetApiKey}
            onChange={onApiKeyChange}
          />
        </Field>
      </FieldSet>
    </>
  );
}
