import * as React from 'react';
import { InlineField, Input, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export type JsonData = {
  customValue?: string;
  [key: string]: any;
};

export type Props = {
  jsonData: JsonData;
  onUpdateJsonData?: (jsonData: JsonData) => void;
};

export const CustomDSConfig = ({ jsonData, onUpdateJsonData = () => {} }: Props) => {
  const s = useStyles2(getStyles);

  return (
    <div className={s.container}>
      <h5>Custom settings</h5>
      <InlineField
        label="Custom option"
        interactive={true}
        tooltip={<>This is a custom option provided by an extension. Stay tuned!</>}
      >
        <>
          <Input
            className="width-20"
            value={jsonData.customValue}
            spellCheck={false}
            placeholder="Type something..."
            onChange={(e) => onUpdateJsonData({ ...jsonData, customValue: e.currentTarget.value })}
          />
        </>
      </InlineField>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    margin-top: ${theme.spacing(6)};
  `,
});
