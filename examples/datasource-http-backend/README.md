# Backend HTTP API data source

This example queries data from an HTTP API.

This differs from datasource-http, because the data fetching happens on the backend.

This allows to use the data source for alerting as well.

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

## Building

### Frontend

```bash
$ yarn install
$ yarn build
```

### Backend

```bash
$ mage -v
```

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
