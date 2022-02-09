import React, { ReactElement } from 'react';
import { InlineFieldRow, InlineField, Select } from '@grafana/ui';
import { useQueryTypes } from './useQueryTypes';
import { useSelectedValue } from './useSelectedValue';
import { useChangeAndRunQuery } from './useChangeAndRunQuery';
import type { EditorProps } from './types';

export function QueryEditor(props: EditorProps): ReactElement {
  const { datasource, query } = props;
  const { loading, queryTypes, error } = useQueryTypes(datasource);
  const queryType = useSelectedValue(queryTypes, query.queryType);
  const onChangeQueryType = useChangeAndRunQuery(props, 'queryType');

  return (
    <InlineFieldRow>
      <InlineField label="Type of query">
        <Select
          defaultValue={true}
          options={queryTypes}
          onChange={onChangeQueryType}
          isLoading={loading}
          disabled={!!error}
          value={queryType}
        />
      </InlineField>
    </InlineFieldRow>
  );
}
