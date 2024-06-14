# Grafana Data Source HTTP Backend Plugin example

This example queries data from an HTTP API. The HTTP API returns data in JSON format, which is then converted to data frames.

This differs from the `datasource-http` example because the data fetching happens in the plugin backend rather than going through Grafana's data source HTTP proxy.

This allows the plugin to use the data source for alerting as well, as the queries are executed on the backend.

This plugin example also showcases other features and best-practices of backend plugins:

- Using the `httpclient` provided by the [Grafana plugins SDK](https://pkg.go.dev/github.com/grafana/grafana-plugin-sdk-go/backend/httpclient)
- Tracing, for better instrumentation of your plugin

This plugin example also includes an example server returning data in the format expected by this plugin (`/server`). Refer to the section below on how to build and run it.

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

## Building

### Frontend

```bash
$ npm install
$ npm run build
```

### Backend

```bash
$ mage -v
```

### Example server

The mockserver required for testing has been included in the Docker Compose file 

Add a new data source in Grafana using the following URL:
```
http://host.docker.internal:10000/metrics
```
