# Grafana Data Source Plugin Template

This example queries data from an HTTP API, which returns data in JSON format and then it's converted to data frames.

This differs from the datasource-http example, because the data fetching happens in the plugin backend rather than going through Grafana's datasource HTTP proxy.

This allows to use the data source for alerting as well, as the query are executed on the backend.

This plugin example also showcases other features and best-practices of backend plugins:

- Using the httpclient provided by the Grafana Plugins SDK
- Tracing, for better instrumentation of your plugin

This plugin example also includes an example server returning data in the format expected by this plugin (`cmd/server`).
Refer to the section below on how to build and run it.

## External service

The plugin expects the following JSON from a remote HTTP API:

```
{
  "datapoints": [
    {"time": "2009-11-10T23:00:00Z", "value": x},
    ...
  ]
}
```

An example HTTP server that returns dummy data in this format is included in `cmd/server`.

### Example server

```bash
$ mage server
$ ./cmd/server/server :10000
2022/10/28 15:43:16 listening on :10000
```

Then, add a new data source in Grafana and use the following url:

```
http://127.0.0.1:10000/metrics
```

## Guides in this example

| **Example**                                        | **Source** |
| -------------------------------------------------- | ---------- |
| How to create HTTP clients on the backend          | TODO       |
| How to configure the HTTP client from the frontend | TODO       |
| How to implement backend health checks             | TODO       |
| How implement tracing and create custom spans      | TODO       |

### How to create HTTP clients on the backend

**Examples:** [datasource.go](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/datasource-http-backend/pkg/plugin/datasource.go#L41)

The Grafana Plugin SDK for Go provides an HTTP client implementation for backend plugins.

When creating an HTTP client, you can pass an option struct to it, which will change various options in the client depending on its value.

There's a corresponding pre-made frontend component (TODO) which can be used to configure the options of a backend HTTP client (as datasourceinstancesettings?)

(SCREENSHOT HERE)

The HTTP client provided by the Grafana Plugins SDK for Go ensures that:

- The correct authentication method and options are set when configuring the HTTP client from the frontend using `backend.DataSourceInstanceSettings`
- HTTP Headers are forwarded, when necessary
- Trace IDs are propagated correctly (if enabled)
- Allocated resources are re-used correctly and work correctly with plugin's instance management
- (TODO) More?

You usually need one client per plugin, to ensure that the allocated resources are re-used correctly.

If possible, you should re-use the same HTTP client for multiple requests and it's safe for concurrent use.

You can create new HTTP clients like so:

```go
cl, _ := httpclient.New(nil)
// cl.Do(req)
```

Additional options can be configured `opts`. See the section below to see how to integrate with the frontend component and get the `opts` struct for
the corresponding options set in the frontend component.

### How to configure the HTTP client from the frontend

**Examples:** [ConfigEditor.tsx](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/datasource-http-backend/src/components/ConfigEditor.tsx#L10), [datasource.go](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/datasource-http-backend/pkg/plugin/datasource.go#L82)

`@grafana/ui` provides the `DataSourceHttpSettings`, which provides fields to configure a variety of options for HTTP clients:

![](TODO IMAGE HERE)

You can use it in your config editor, like so:

```typescript
import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourceJsonData } from '@grafana/data';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';

export interface MyDataSourceOptions extends DataSourceJsonData {}

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  render() {
    const { options } = this.props;
    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <DataSourceHttpSettings
            defaultUrl="http://127.0.0.1:10000/metrics"
            dataSourceConfig={options}
            onChange={this.props.onOptionsChange}
          />
        </div>
      </div>
    );
  }
}
```

Those options will be stored in SecureJSONData (TODO).

The corresponding go type to unmarshal those settings on the backend is `backend.DataSourceInstanceSettings`:

```go
type Datasource struct {
	settings backend.DataSourceInstanceSettings
}

func NewDatasource(settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
  // Decode the HTTP client options set by the frontend component
	opts, err := settings.HTTPClientOptions()
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}

  // Use those options to create a new HTTP client
  cl, err := httpclient.New(opts)
  // cl.Do(req)
}
```

### How to implement backend health checks

**Examples:** TODO

TODO

### How implement tracing and create custom spans

**Examples:** TODO

TODO

## Learn more

- [Backend plugins](https://grafana.com/docs/grafana/latest/developers/plugins/backend/)
- [Authenticate using a backend plugin](https://grafana.com/docs/grafana/latest/developers/plugins/add-authentication-for-data-source-plugins/#authenticate-using-a-backend-plugin)
- [Add distributed tracing for backend plugins](https://grafana.com/docs/grafana/latest/developers/plugins/add-distributed-tracing-for-backend-plugins/)
