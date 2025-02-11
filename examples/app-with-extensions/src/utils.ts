import { DataQuery } from '@grafana/schema';

export function selectQuery(target: DataQuery): void {
  alert(`You selected query "${target.refId}"`);
}
