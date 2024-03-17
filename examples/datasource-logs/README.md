# Logs Data Source Plugin for Grafana 

This repository contains a data source plugin with logs.

## Overview

The Logs Data Source Plugin demonstrates the integration of log data sources into Grafana dashboards. This plugin serves as an example for developers who want to incorporate log data from various sources into their Grafana visualizations.

This is an example of a data source plugin that implements logging features. You can learn more in our [documentation](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin).

## Get started

Data source plugins consist of both frontend and backend components. Install these components with the following CLI commands.

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

1. Set up a backend server:


```bash
$ mage server
$ ./cmd/server/server :10000
2022/10/28 15:43:16 listening on :10000
```

2. Add a new data source in Grafana and use the following URL:

```
http://127.0.0.1:10000/metrics
```

## Learn more

- [Grafana plugins documentation](https://grafana.com/developers/plugin-tools/)
- [Build a data source plugin tutorial](https://grafana.com/developers/plugin-tools/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)