package main

import (
	"fmt"
	"github.com/grafana/datasource-http-backend/pkg/service"
	"net/http"
	"os"

	"github.com/grafana/datasource-http-backend/pkg/plugin"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func main() {
	// TODO: Move to separate binary?
	go func() {
		svc := service.NewService()
		svc.Logger.Info("http server: starting")
		if err := http.ListenAndServe(":10000", svc.Handler); err != nil {
			svc.Logger.Error(fmt.Errorf("listen and serve: %w", err).Error())
		}
		svc.Logger.Info("http server: stopped")
	}()

	// Start listening to requests sent from Grafana. This call is blocking so
	// it won't finish until Grafana shuts down the process or the plugin choose
	// to exit by itself using os.Exit. Manage automatically manages life cycle
	// of datasource instances. It accepts datasource instance factory as first
	// argument. This factory will be automatically called on incoming request
	// from Grafana to create different instances of SampleDatasource (per datasource
	// ID). When datasource configuration changed Dispose method will be called and
	// new datasource instance created using NewSampleDatasource factory.
	if err := datasource.Manage("grafana-datasource-http-backend", plugin.NewDatasource, datasource.ManageOpts{}); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
