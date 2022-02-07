import React, { ReactElement, useCallback } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { BasicDataSource } from '../datasource';
import { BasicDataSourceOptions, BasicQuery } from '../types';
import { AsyncSelect } from '@grafana/ui';

type Props = QueryEditorProps<BasicDataSource, BasicQuery, BasicDataSourceOptions>;

export function QueryEditor({ datasource, onChange, query }: Props): ReactElement {
  const onChangeQuery = useCallback(
    (selectable: SelectableValue<string>) => {
      if (!selectable?.value) {
        return;
      }

      onChange({
        ...query,
        scenario: selectable.value,
      });
    },
    [onChange, query]
  );

  return (
    <div>
      <AsyncSelect
        loadingMessage="Retrieves selectable scenarios..."
        onChange={onChangeQuery}
        value={{ value: query.scenario }}
        loadOptions={() => datasource.getScenarios()}
        cacheOptions={true}
        defaultOptions={true}
      />
    </div>
  );
}
