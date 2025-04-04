import React, { PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import { Stack, Input, Label } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  render() {
    return (
      <Stack alignItems="center">
        <Label htmlFor="multiplier">Multiplier</Label>
        <Input
          type="number"
          id="multiplier"
          name="multiplier"
          value={this.props.query.multiplier}
          onChange={(e) => this.props.onChange({ ...this.props.query, multiplier: e.currentTarget.valueAsNumber })}
        />
      </Stack>
    );
  }
}
