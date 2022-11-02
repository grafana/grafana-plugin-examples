# Server
Example external service that can be used by the datasource http backend plugin.

This is an HTTP web server that implements a `GET /metrics` handler that returns JSON data in the following format:

```
{
  "datapoints": [
    {"time": "2009-11-10T23:00:00Z", "value": x},
    ...
  ]
}
```
