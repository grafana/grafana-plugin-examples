package plugin

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/rbac-client-poc/pkg/authz/api"
	"github.com/grafana/rbac-client-poc/pkg/authz/permissions"
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
	permissionClient permissions.EnforcementClient
}

// NewApp creates a new example *App instance.
func NewApp(_ context.Context, settings backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	var app App

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

	// Initialize the RBAC client
	client, err := api.NewClient(api.ClientCfg{
		GrafanaURL: grafanaURL,
		Token:      saToken,
		JWKsURL:    strings.TrimRight(grafanaURL, "/") + "/api/signing-keys/keys", // TODO how do we provision this?
	})
	if err != nil {
		return nil, err
	}

	app.permissionClient = permissions.NewEnforcementClient(client,
		permissions.WithPreloadPrefixedPermissions("grafana-appwithrbac-app"))

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
