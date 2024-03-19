package plugin

import (
	"context"
	"fmt"
	"net/http"
	"os"
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
	authzClient authz.EnforcementClient
}

// NewApp creates a new example *App instance.
func NewApp(pCtx context.Context, settings backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	var app App

	ctxLogger := log.DefaultLogger.FromContext(pCtx)

	// Use a httpadapter (provided by the SDK) for resource calls. This allows us
	// to use a *http.ServeMux for resource calls, so we can map multiple routes
	// to CallResource without having to implement extra logic.
	mux := http.NewServeMux()
	app.registerRoutes(mux)
	app.CallResourceHandler = httpadapter.New(mux)

	grafanaURL := os.Getenv("GF_APP_URL")
	if grafanaURL == "" {
		return nil, fmt.Errorf("GF_APP_URL is required")
	}

	saToken := os.Getenv("GF_PLUGIN_APP_CLIENT_SECRET")
	if saToken == "" {
		return nil, fmt.Errorf("GF_PLUGIN_APP_CLIENT_SECRET is required")
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

	ctxLogger.Info("Authz client initialized")
	app.authzClient = client

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
