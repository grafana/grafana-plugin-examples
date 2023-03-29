package plugin

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/google/uuid"
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

type permission struct {
	Action string `json:"action"`
	Scope  string `json:"scope"`
}

type key struct {
	Generate bool `json:"generate"`
}

type oauthAppRegistration struct {
	Name                   string       `json:"name"`
	RedirectURI            string       `json:"redirect_uri"`
	Permissions            []permission `json:"permissions"`
	ImpersonatePermissions []permission `json:"impersonatePermissions"`
	Key                    key          `json:"key"`
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
	log.DefaultLogger.Info("GF_APP_URL", "url", app.grafanaAppURL)
	if app.grafanaAppURL == "" {
		// For debugging purposes only
		app.grafanaAppURL = "http://localhost:3000"
	}

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

	// This approach requires the API endpoint /oauth2/register to be exposed
	// And would need a secure way to connect to it in the future.
	authAppUID := uuid.New().String()
	oauthAppInstance := oauthAppRegistration{
		Name:        "Test App - " + authAppUID,
		RedirectURI: app.grafanaAppURL + "/a/test-app/",
		Permissions: []permission{
			{Action: "users:impersonate", Scope: "users:*"},
			{Action: "users:read", Scope: "global.users:*"},
			{Action: "users.permissions:read", Scope: "users:*"},
			{Action: "teams:read", Scope: "teams:*"},
			{Action: "dashboards:create", Scope: "folders:uid:general"},
		},
		ImpersonatePermissions: []permission{
			{Action: "dashboards:create", Scope: "folders:*"},
			{Action: "dashboards:read", Scope: "dashboards:*"},
			{Action: "dashboards:read", Scope: "folders:*"},
			{Action: "folders:read", Scope: "folders:*"},
		},
		Key: key{Generate: true},
	}
	oauthAppInstanceJson, err := json.Marshal(oauthAppInstance)
	if err != nil {
		return nil, err
	}

	// Note: This generates a new app every time the plugin is loaded
	body := bytes.NewBuffer(oauthAppInstanceJson)
	req, err := http.NewRequest("POST", app.grafanaAppURL+"/oauth2/register", body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := cl.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var appResp oauthApp
	err = json.NewDecoder(resp.Body).Decode(&appResp)
	if err != nil {
		panic(err)
	}

	app.authApp = &appResp

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
