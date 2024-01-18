import React, { PureComponent } from 'react';
import { Button, DataSourceHttpSettings, HorizontalGroup, VerticalGroup } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from '../types';
import { getBackendSrv } from '@grafana/runtime';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

// const resourceURL = `api/plugins/grafana-datasourcehttpbackend-datasource/resources/resource`;

export class ConfigEditor extends PureComponent<Props, State> {
  render() {
    const { options } = this.props;
    let resourceURL = `/api/datasources/uid/${options.uid}/resources/resource`;
    return (
      <>
        <VerticalGroup>
          <HorizontalGroup>
            <Button onClick={() => getBackendSrv().get(resourceURL)}>Call resource GET</Button>
            <Button onClick={() => getBackendSrv().post(resourceURL)}>Call resource POST</Button>
          </HorizontalGroup>
          <DataSourceHttpSettings
            defaultUrl="http://127.0.0.1:10000/metrics"
            dataSourceConfig={options}
            onChange={this.props.onOptionsChange}
          />
        </VerticalGroup>
      </>
    );
  }
}
