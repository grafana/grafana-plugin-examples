package plugin

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/grafana/authlib/authz"
	"github.com/grafana/authlib/cache"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
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

// App is an example app backend plugin which can respond to data queries.
type App struct {
	backend.CallResourceHandler
	saToken     string
	authzClient authz.EnforcementClient
}

// NewApp creates a new example *App instance.
func NewApp(pCtx context.Context, settings backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	var app App

	// Use a httpadapter (provided by the SDK) for resource calls. This allows us
	// to use a *http.ServeMux for resource calls, so we can map multiple routes
	// to CallResource without having to implement extra logic.
	mux := http.NewServeMux()
	app.registerRoutes(mux)
	app.CallResourceHandler = httpadapter.New(mux)

	return &app, nil
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

// GetClientFromContext returns an authz enforcement client configured thanks to the plugin context.
func (a *App) GetClientFromContext(req *http.Request) (authz.EnforcementClient, error) {
	ctx := req.Context()
	ctxLogger := log.DefaultLogger.FromContext(ctx)
	cfg := backend.GrafanaConfigFromContext(ctx)

	saToken, err := cfg.PluginAppClientSecret()
	if err != nil || saToken == "" {
		if err == nil {
			err = errors.New("service account token not found")
		}
		ctxLogger.Error("Service account token not found", "error", err)
		return nil, err
	}

	if saToken == a.saToken {
		ctxLogger.Debug("Token unchanged returning existing client")
		return a.authzClient, nil
	}

	grafanaURL, err := cfg.AppURL()
	if err != nil {
		ctxLogger.Error("App URL not found", "error", err)
		return nil, err
	}

	// Initialize the authorization client
	client, err := authz.NewEnforcementClient(authz.Config{
		APIURL: grafanaURL,
		Token:  saToken,
		// Grafana is signing the JWTs on local setups
		JWKsURL: strings.TrimRight(grafanaURL, "/") + "/api/signing-keys/keys",
	},
		// Fetch all the user permission prefixed with grafana-appwithrbac-app
		authz.WithSearchByPrefix("grafana-appwithrbac-app"),
		// Use a cache with a lower expiry time
		authz.WithCache(cache.NewLocalCache(cache.Config{
			Expiry:          10 * time.Second,
			CleanupInterval: 5 * time.Second,
		})),
	)
	if err != nil {
		ctxLogger.Error("Initializing authz client", "error", err)
		return nil, err
	}

	a.saToken = saToken
	a.authzClient = client

	return client, nil
}
