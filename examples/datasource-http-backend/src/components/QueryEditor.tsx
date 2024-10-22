import React, { useState, useEffect } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import { HorizontalGroup, Input, Label } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export const QueryEditor = (props: Props) => {
  const [query, setQuery] = useState<MyQuery>(props.query);
  useEffect(() => {
    props.datasource.migrateQuery(props.query).then((query) => {
      setQuery(query);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChangeMultiplier = (multiply: number) => {
    const newQuery = { ...query, multiply, pluginVersion: props.datasource.meta.info.version };
    setQuery(newQuery);
    props.onChange(newQuery);
  };

  return (
    <HorizontalGroup>
      <Label htmlFor="multiplier">Multiplier</Label>
      <Input
        type="number"
        id="multiplier"
        name="multiplier"
        value={query.multiply}
        onChange={(e) => onChangeMultiplier(e.currentTarget.valueAsNumber)}
      />
    </HorizontalGroup>
  );
};
