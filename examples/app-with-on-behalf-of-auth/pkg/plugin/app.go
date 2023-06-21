package plugin

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/sign"
)

// Make sure App implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. Plugin should not implement all these interfaces - only those which are
// required for a particular task.
var (
	_ backend.CallResourceHandler   = (*App)(nil)
	_ instancemgmt.InstanceDisposer = (*App)(nil)
	_ backend.CheckHealthHandler    = (*App)(nil)
)

// App is an example app backend plugin which can respond to data queries.
type App struct {
	backend.CallResourceHandler
	httpClient     *http.Client
	grafanaAppURL  string
	tokenRetriever *sign.TokenRetriever
}

// NewApp creates a new example *App instance.
func NewApp(settings backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	var app App

	// Use a httpadapter (provided by the SDK) for resource calls. This allows us
	// to use a *http.ServeMux for resource calls, so we can map multiple routes
	// to CallResource without having to implement extra logic.
	mux := http.NewServeMux()
	app.registerRoutes(mux)
	app.CallResourceHandler = httpadapter.New(mux)

	opts, err := settings.HTTPClientOptions()
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}
	cl, err := httpclient.New(opts)
	if err != nil {
		return nil, fmt.Errorf("httpclient new: %w", err)
	}
	app.httpClient = cl

	// The Grafana URL is required to obtain tokens later on
	app.grafanaAppURL = strings.TrimRight(os.Getenv("GF_APP_URL"), "/")
	if app.grafanaAppURL == "" {
		// For debugging purposes only
		app.grafanaAppURL = "http://localhost:3000"
	}
	// Service account credentials required to obtain tokens
	if os.Getenv("GF_PLUGIN_APP_CLIENT_ID") != "" {
		tr, err := sign.New(
			os.Getenv("GF_PLUGIN_APP_CLIENT_ID"),
			os.Getenv("GF_PLUGIN_APP_CLIENT_SECRET"),
			os.Getenv("GF_PLUGIN_APP_PRIVATE_KEY"),
			app.grafanaAppURL,
			app.httpClient)
		if err != nil {
			return nil, err
		}
		app.tokenRetriever = tr
		return &app, nil
	}

	return nil, errors.New("missing required OAuth credentials")
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created.
func (a *App) Dispose() {
	// cleanup
}

// CheckHealth handles health checks sent from Grafana to the plugin.
func (a *App) CheckHealth(_ context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "ok",
	}, nil
}
