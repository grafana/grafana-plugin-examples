import { useCallback } from 'react';
import type { SelectableValue } from '@grafana/data';
import type { BasicQuery } from '../../types';
import type { ChangeOptions, EditorProps } from './types';

type OnChangeType = (value: SelectableValue<string>) => void;

export function useChangeSelectableValue(props: EditorProps, options: ChangeOptions<BasicQuery>): OnChangeType {
  const { onChange, onRunQuery, query } = props;
  const { propertyName, runQuery } = options;

  return useCallback(
    (selectable: SelectableValue<string>) => {
      if (!selectable?.value) {
        return;
      }

      onChange({
        ...query,
        [propertyName]: selectable.value,
      });

      if (runQuery) {
        onRunQuery();
      }
    },
    [onChange, onRunQuery, query, propertyName, runQuery]
  );
}
