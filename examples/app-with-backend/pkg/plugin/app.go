package plugin

import (
	"context"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/storedobjects"
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

// App is an example app plugin with a backend which can respond to data queries.
type App struct {
	backend.CallResourceHandler

	// cancelEvaluator stops the background watchlist evaluator. Nil when the
	// evaluator never started (see startWatchlistEvaluator).
	cancelEvaluator context.CancelFunc
}

// NewApp creates a new example *App instance.
func NewApp(ctx context.Context, _ backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	var app App

	// Use a httpadapter (provided by the SDK) for resource calls. This allows us
	// to use a *http.ServeMux for resource calls, so we can map multiple routes
	// to CallResource without having to implement extra logic.
	mux := http.NewServeMux()
	app.registerRoutes(mux)
	app.CallResourceHandler = httpadapter.New(mux)

	app.startWatchlistEvaluator(ctx)

	return &app, nil
}

// startWatchlistEvaluator starts the background goroutine that reconciles
// Watchlist status (see evaluator.go). The instance factory context carries
// the Grafana config and PluginContext for the request that triggered
// instance creation, which is everything the self-client needs.
func (a *App) startWatchlistEvaluator(ctx context.Context) {
	logger := log.DefaultLogger

	// The self-client authenticates with the plugin's provisioned service
	// account token, which Grafana only supplies when its
	// externalServiceAccounts feature toggle is enabled. The capability is
	// opt-in and this example must keep working on a vanilla Grafana, so when
	// the token (or config) is unavailable we skip the evaluator instead of
	// failing instance creation. The group is the plugin ID from plugin.json.
	client, err := storedobjects.NewClientFromContext(ctx, "myorg-backend-app")
	if err != nil {
		logger.Info("watchlist evaluator disabled: stored-objects self-client unavailable", "reason", err)
		return
	}

	// Namespace comes from the plugin context. Newer Grafanas populate
	// PluginContext.Namespace directly; fall back to deriving it from the
	// (deprecated) OrgID for older ones.
	pCtx := backend.PluginConfigFromContext(ctx)
	namespace := pCtx.Namespace
	if namespace == "" {
		namespace = storedobjects.NamespaceForOrgID(pCtx.OrgID) // nolint:staticcheck
	}

	// The evaluator must outlive the (request-scoped) factory context, so it
	// gets its own context, canceled in Dispose when Grafana recycles the
	// instance.
	evalCtx, cancel := context.WithCancel(context.Background())
	a.cancelEvaluator = cancel

	logger.Info("starting watchlist evaluator", "namespace", namespace)
	go newWatchlistEvaluator(client, namespace, logger).run(evalCtx)
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created.
func (a *App) Dispose() {
	if a.cancelEvaluator != nil {
		a.cancelEvaluator()
	}
}

// CheckHealth handles health checks sent from Grafana to the plugin.
func (a *App) CheckHealth(_ context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "ok",
	}, nil
}
