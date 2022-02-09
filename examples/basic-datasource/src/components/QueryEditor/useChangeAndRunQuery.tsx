import { useCallback } from 'react';
import type { SelectableValue } from '@grafana/data';
import type { BasicQuery } from '../../types';
import type { EditorProps } from './types';

type OnChangeType = (value: SelectableValue<string>) => void;

export function useChangeAndRunQuery(props: EditorProps, propertyName: keyof BasicQuery): OnChangeType {
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
