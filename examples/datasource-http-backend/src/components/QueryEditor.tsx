import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import { HorizontalGroup, Input, Label } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor(props: Props) {
  const query = props.datasource.migrateQuery(props.query);
  return (
    <HorizontalGroup>
      <Label htmlFor="multiplier">Multiplier</Label>
      <Input
        type="number"
        id="multiplier"
        name="multiplier"
        value={query.multiply}
        onChange={(e) => props.onChange({ ...query, multiply: e.currentTarget.valueAsNumber })}
      />
    </HorizontalGroup>
  );
}
