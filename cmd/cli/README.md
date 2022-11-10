# Generate TypeScript of schemas

In the root of the repo

```bash
make build
```

Generate TypeScript for panel-basic schemas:
```bash
./bin/cli -i ./examples/panel-basic/schemas
main.go:106: Generated TypeScript: export interface Basic-Panel {
  PanelFieldConfig: Record<string, unknown>;
  PanelOptions: {
    legend: VizLegendOptions;
  };
}

main.go:53: Failed to get panel lineage error no Query lineage found: field not found: Query
```

Generate TypeScript for datasource-http schemas:
```bash
./bin/cli -i ./examples/datasource-http/schemas
main.go:44: Failed to get panel lineage error no Panel lineage found: field not found: Panel
main.go:106: Generated TypeScript: export interface Example-Http-Datasource {
  constant: number;
  queryText?: string;
}
```

Generate TypeScript for datasource-http-backend schemas:
```bash
./bin/cli -i ./examples/datasource-http-backend/schemas
main.go:44: Failed to get panel lineage error no Panel lineage found: field not found: Panel
main.go:106: Generated TypeScript: export interface Grafana-Datasourcehttpbackend-Datasource {}
```
