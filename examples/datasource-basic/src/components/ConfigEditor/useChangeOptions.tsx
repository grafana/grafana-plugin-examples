import { ChangeEvent, useCallback } from 'react';
import type { BasicDataSourceOptions } from 'types';
import type { EditorProps } from './types';

type OnChangeType = (event: ChangeEvent<HTMLInputElement>) => void;

export function useChangeOptions(props: EditorProps, propertyName: keyof BasicDataSourceOptions): OnChangeType {
  const { onOptionsChange, options } = props;

  return useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onOptionsChange({
        ...options,
        jsonData: {
          ...options.jsonData,
          [propertyName]: event.target.value,
        },
      });
    },
    [onOptionsChange, options, propertyName]
  );
}
