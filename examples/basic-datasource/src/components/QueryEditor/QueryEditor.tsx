import React, { ReactElement } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineFieldRow, InlineField, Select } from '@grafana/ui';
import { BasicDataSource } from '../../datasource';
import { BasicDataSourceOptions, BasicQuery } from '../../types';
import { useQueryTypes } from './useQueryTypes';
import { useSelectedValue } from './useSelectedValue';
import { useChangeAndRunQuery } from './useChangeAndRunQuery';

type Props = QueryEditorProps<BasicDataSource, BasicQuery, BasicDataSourceOptions>;

export function QueryEditor(props: Props): ReactElement {
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
