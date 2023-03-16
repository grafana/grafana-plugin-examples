package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"

	"github.com/grafana/grafana-plugin-examples/examples/datasource-tracing/pkg/plugin"
)

func main() {
	// datasource.Manage starts the plugin, and it takes care of its lifecycle.
	// It will also set up the global tracer with the endpoint and propagator provided by Grafana, and shut it down
	// when exiting the plugin. You can also specify some tracing-related options in DatasourceOpts.
	if err := datasource.Manage("grafana-tracing-datasource", plugin.NewDatasource, plugin.DatasourceOpts); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
