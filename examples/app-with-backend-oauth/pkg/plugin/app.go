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
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
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

// TODO: These types could be exposed in the SDK
type oauthAppKey struct {
	Private   string `json:"private"`
	Public    string `json:"public"`
	Generated bool   `json:"generated"`
}

type oauthApp struct {
	Name         string      `json:"name"`
	ClientID     string      `json:"clientId"`
	ClientSecret string      `json:"clientSecret"`
	GrantTypes   string      `json:"grantTypes"`
	Key          oauthAppKey `json:"key"`
}

//////

// App is an example app backend plugin which can respond to data queries.
type App struct {
	backend.CallResourceHandler
	authApp       *oauthApp
	grafanaAppURL string
	httpClient    *http.Client
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

	// The Grafana URL is required to obtain tokens later on
	app.grafanaAppURL = strings.TrimRight(os.Getenv("GF_APP_URL"), "/")
	if app.grafanaAppURL == "" {
		// For debugging purposes only
		app.grafanaAppURL = "http://localhost:3000"
	}
	log.DefaultLogger.Info("GF_APP_URL", "url", app.grafanaAppURL)

	opts, err := settings.HTTPClientOptions()
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}
	cl, err := httpclient.New(opts)
	if err != nil {
		return nil, fmt.Errorf("httpclient new: %w", err)
	}
	app.httpClient = cl

	// This approach requires the plugin manager to register the app
	if os.Getenv("GF_PLUGIN_APP_CLIENT_ID") != "" {
		app.authApp = &oauthApp{
			ClientID:     os.Getenv("GF_PLUGIN_APP_CLIENT_ID"),
			ClientSecret: os.Getenv("GF_PLUGIN_APP_CLIENT_SECRET"),
			Key: oauthAppKey{
				Private: os.Getenv("GF_PLUGIN_APP_PRIVATE_KEY"),
			},
		}
		log.DefaultLogger.Info("Got app from env", "app", app.authApp.ClientID)
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
