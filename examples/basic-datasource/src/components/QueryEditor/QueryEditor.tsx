import React, { ReactElement } from 'react';
import { css } from '@emotion/css';
import { InlineFieldRow, InlineField, Select, CodeEditor, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { useQueryTypes } from './useQueryTypes';
import { useSelectableValue } from './useSelectableValue';
import { useChangeSelectableValue } from './useChangeSelectableValue';
import type { EditorProps } from './types';
import { useChangeString } from './useChangeString';

export function QueryEditor(props: EditorProps): ReactElement {
  const { datasource, query } = props;
  const styles = useStyles2(getStyles);

  const { loading, queryTypes, error } = useQueryTypes(datasource);
  const queryType = useSelectableValue(query.queryType);

  const onChangeQueryType = useChangeSelectableValue(props, {
    propertyName: 'queryType',
    runQuery: true,
  });

  const onChangeRawQuery = useChangeString(props, {
    propertyName: 'rawQuery',
    runQuery: true,
  });

  return (
    <>
      <div className={styles.editor}>
        <CodeEditor
          height="200px"
          showLineNumbers={true}
          language="sql"
          onBlur={onChangeRawQuery}
          value={query.rawQuery}
        />
      </div>
      <InlineFieldRow>
        <InlineField label="Query type" grow>
          <Select
            options={queryTypes}
            onChange={onChangeQueryType}
            isLoading={loading}
            disabled={!!error}
            value={queryType}
          />
        </InlineField>
      </InlineFieldRow>
    </>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    editor: css`
      margin: ${theme.spacing(0, 0.5, 0.5, 0)};
    `,
  };
}
