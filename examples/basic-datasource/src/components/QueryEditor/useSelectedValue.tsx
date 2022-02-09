import { useMemo } from 'react';
import type { SelectableValue } from '@grafana/data';

export function useSelectedValue(
  options: Array<SelectableValue<string>>,
  value: string | undefined
): SelectableValue<string> {
  return useMemo(() => {
    if (!value && options.length > 0) {
      return options[0];
    }

    return {
      label: value,
      value: value,
    };
  }, [options, value]);
}
