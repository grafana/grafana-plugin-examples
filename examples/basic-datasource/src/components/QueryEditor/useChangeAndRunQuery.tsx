import { useCallback } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { BasicDataSource } from '../../datasource';
import { BasicDataSourceOptions, BasicQuery } from '../../types';

type Props = QueryEditorProps<BasicDataSource, BasicQuery, BasicDataSourceOptions>;
type OnChangeType = (value: SelectableValue<string>) => void;

export function useChangeAndRunQuery(props: Props, propertyName: keyof BasicQuery): OnChangeType {
  const { onChange, onRunQuery, query } = props;

  return useCallback(
    (selectable: SelectableValue<string>) => {
      if (!selectable?.value) {
        return;
      }

      onChange({
        ...query,
        [propertyName]: selectable.value,
      });
      onRunQuery();
    },
    [onChange, onRunQuery, query, propertyName]
  );
}
