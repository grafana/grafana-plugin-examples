# Data Source HTTP Backend Plugin for Grafana

This repository contains a backend data source plugin that queries data from an HTTP API.

## Overview

The Data Source HTTP Backend Plugin showcases the integration of a backend HTTP service as a custom data source within Grafana. This plugin serves as a reference implementation for developers aiming to incorporate HTTP-based data sources into their Grafana dashboards.

This example queries data from an HTTP API. The HTTP API returns data in JSON format, which is then converted to data frames.

This plugin differs from the `datasource-http` example because the data fetching happens in the plugin backend rather than going through Grafana's data source HTTP proxy.

This allows the plugin to use the data source for alerting as well, as the queries are executed on the backend.

This plugin example also showcases other features and best-practices of backend plugins:

- Using the `httpclient` provided by the [Grafana Plugin SDK for Go](https://pkg.go.dev/github.com/grafana/grafana-plugin-sdk-go/backend/httpclient)
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

An example HTTP server that returns dummy data in this format is included in `cmd/server`.

## Get started

Data source plugins consist of both frontend and backend components. Install these components with the following CLI commands.
## Building

### Frontend

Install dependencies and build:

```bash
$ npm install
$ npm run build
```

### Backend

Build backend plugin binaries for Linux, Windows and Darwin:

```bash
$ mage -v
```

### Set up a server

1. Set up a backend server to return data:


```bash
$ mage server
$ ./cmd/server/server :10000
2022/10/28 15:43:16 listening on :10000
```

2. Add a new data source in Grafana and use the following URL:
The mockserver required for testing has been included in the Docker Compose file 

Add a new data source in Grafana using the following URL:
```
http://host.docker.internal:10000/metrics
```

## Learn more

- [Grafana plugins documentation](https://grafana.com/developers/plugin-tools/)
- [Grafana UI components documentation](https://developers.grafana.com/ui/latest/index.html)
- [Build a data source plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)