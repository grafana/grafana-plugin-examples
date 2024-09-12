import { QueryEditorProps } from '@grafana/data';
import { InlineField, Input, Stack } from '@grafana/ui';
import defaults from 'lodash/defaults';
import React, { ChangeEvent, PureComponent } from 'react';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, constant: parseFloat(event.target.value) });
    // executes the query
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, constant } = query;

    return (
      <Stack>
        <InlineField label="Constant" labelWidth={14}>
          <Input data-testid="constant" onChange={this.onConstantChange} value={constant} type="number" step={0.1} />
        </InlineField>
        <InlineField label="Query Text" labelWidth={14} tooltip="Not used yet">
          <Input data-testid="query-text" onChange={this.onQueryTextChange} value={queryText || ''} />
        </InlineField>
      </Stack>
    );
  }
}
