import React from 'react';
import { render, screen } from '@testing-library/react';
import { PluginType } from '@grafana/data';
import { AppConfig, AppConfigProps } from './AppConfig';

describe('Components/AppConfig', () => {
  let props: AppConfigProps;

  beforeEach(() => {
    jest.resetAllMocks();

    props = {
      plugin: {
        meta: {
          id: 'sample-app',
          name: 'Sample App',
          type: PluginType.app,
          enabled: true,
          jsonData: {},
        },
      },
      query: {},
    } as unknown as AppConfigProps;
  });

  test('renders without an error"', () => {
    render(<AppConfig plugin={props.plugin} query={props.query} />);

    expect(screen.queryByText(/Enable \/ Disable/i)).toBeInTheDocument();
  });

  test('renders an "Enable" button if the plugin is disabled', () => {
    const plugin = { meta: { ...props.plugin.meta, enabled: false } };

    // @ts-ignore - We don't need to provide `addConfigPage()` and `setChannelSupport()` for these tests
    render(<AppConfig plugin={plugin} query={props.query} />);

    expect(screen.queryByText(/The plugin is currently not enabled./i)).toBeInTheDocument();
    expect(screen.queryByText(/The plugin is currently enabled./i)).not.toBeInTheDocument();
  });

  test('renders a "Disable" button if the plugin is enabled', () => {
    const plugin = { meta: { ...props.plugin.meta, enabled: true } };

    // @ts-ignore - We don't need to provide `addConfigPage()` and `setChannelSupport()` for these tests
    render(<AppConfig plugin={plugin} query={props.query} />);

    expect(screen.queryByText(/The plugin is currently enabled./i)).toBeInTheDocument();
    expect(screen.queryByText(/The plugin is currently not enabled./i)).not.toBeInTheDocument();
  });
});
