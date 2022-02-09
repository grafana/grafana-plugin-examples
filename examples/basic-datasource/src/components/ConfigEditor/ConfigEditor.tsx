import React, { ReactElement } from 'react';
import { LegacyForms } from '@grafana/ui';
import type { EditorProps } from './types';
import { useChangeOptions } from './useChangeOptions';
import { useChangeSecureOptions } from './useChangeSecureOptions';
import { useResetSecureOptions } from './useResetSecureOptions';

const { SecretFormField, FormField } = LegacyForms;

export function ConfigEditor(props: EditorProps): ReactElement {
  const { jsonData, secureJsonData } = props.options;
  const onTimeColumnChange = useChangeOptions(props, 'defaultTimeField');
  const onApiKeyChange = useChangeSecureOptions(props, 'apiKey');
  const onResetApiKey = useResetSecureOptions(props, 'apiKey');

  return (
    <div className="gf-form-group">
      <div className="gf-form">
        <FormField
          label="Path"
          labelWidth={6}
          inputWidth={20}
          onChange={onTimeColumnChange}
          value={jsonData.defaultTimeField || 'time'}
          placeholder="json field returned to frontend"
        />
      </div>

      <div className="gf-form-inline">
        <div className="gf-form">
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
        </div>
      </div>
    </div>
  );
}
