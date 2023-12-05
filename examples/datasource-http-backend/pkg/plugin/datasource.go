package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	gapi "github.com/grafana/grafana-api-golang-client"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"go.opentelemetry.io/otel/attribute"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces- only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

var (
	errRemoteRequest  = errors.New("remote request error")
	errRemoteResponse = errors.New("remote response error")
)

// NewDatasource creates a new datasource instance.
func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	opts, err := settings.HTTPClientOptions(ctx)
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}

	// Uncomment the following to forward all HTTP headers in the requests made by the client
	// (disabled by default since SDK v0.161.0)
	// opts.ForwardHTTPHeaders = true

	// Using httpclient.New without any provided httpclient.Options creates a new HTTP client with a set of
	// default middlewares (httpclient.DefaultMiddlewares) providing additional built-in functionality, such as:
	//	- TracingMiddleware (creates spans for each outgoing HTTP request)
	//	- BasicAuthenticationMiddleware (populates Authorization header if basic authentication been configured via the
	//		DataSourceHttpSettings component from @grafana/ui)
	//	- CustomHeadersMiddleware (populates headers if Custom HTTP Headers been configured via the DataSourceHttpSettings
	//		component from @grafana/ui)
	//	- ContextualMiddleware (custom middlewares per context.Context, see httpclient.WithContextualMiddleware)
	cl, err := httpclient.New(opts)
	if err != nil {
		return nil, fmt.Errorf("httpclient new: %w", err)
	}

	s, err := loadSettings(ctx, settings)
	if err != nil {
		return nil, fmt.Errorf("load settings: %w", err)
	}

	c, err := newGrafanaClient(cl, s)
	if err != nil {
		return nil, fmt.Errorf("new grafana client: %w", err)
	}

	return &Datasource{
		client: c,
	}, nil
}

// DatasourceOpts contains the default ManageOpts for the datasource.
var DatasourceOpts = datasource.ManageOpts{
	TracingOpts: tracing.Opts{
		// Optional custom attributes attached to the tracer's resource.
		// The tracer will already have some SDK and runtime ones pre-populated.
		CustomAttributes: []attribute.KeyValue{
			attribute.String("my_plugin.my_attribute", "custom value"),
		},
	},
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	client *gapi.Client
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// Spans are created automatically for QueryData and all other plugin interface methods.
	// The span's context is in the ctx, you can get it with trace.SpanContextFromContext(ctx)
	// Check out OpenTelemetry's Go SDK documentation for more information on how to use it.
	// sctx := trace.SpanContextFromContext(ctx)

	// logger.FromContext creates a new sub-logger with the parameters stored in the context.
	// By default, the following log parameters are added:
	// traceID, pluginID, endpoint and some attributes identifying the datasource/user (if available)
	// You can add more log parameters to a context.Context using log.WithContextualAttributes.
	// You can also create your own loggers using log.New, rather than using log.DefaultLogger.
	ctxLogger := log.DefaultLogger.FromContext(ctx)
	ctxLogger.Debug("QueryData", "queries", len(req.Queries))

	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for i, q := range req.Queries {
		ctxLogger.Debug("Processing query", "number", i, "ref", q.RefID)

		if i%2 != 0 {
			// Just to demonstrate how to return an error with a custom status code.
			response.Responses[q.RefID] = backend.ErrDataResponse(
				backend.StatusBadRequest,
				fmt.Sprintf("user friendly error for query number %v, excluding any sensitive information", i+1),
			)
			continue
		}

		res, err := d.query(ctx, req.PluginContext, q)
		switch {
		case err == nil:
			break
		case errors.Is(err, context.DeadlineExceeded):
			res = backend.ErrDataResponse(backend.StatusTimeout, "gateway timeout")
		case errors.Is(err, errRemoteRequest):
			res = backend.ErrDataResponse(backend.StatusBadGateway, "bad gateway request")
		case errors.Is(err, errRemoteResponse):
			res = backend.ErrDataResponse(backend.StatusValidationFailed, "bad gateway response")
		default:
			res = backend.ErrDataResponse(backend.StatusInternal, err.Error())
		}
		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

func (d *Datasource) query(_ context.Context, _ backend.PluginContext, query backend.DataQuery) (backend.DataResponse, error) {
	input := &apiQuery{}
	err := json.Unmarshal(query.JSON, input)
	if err != nil {
		return backend.DataResponse{}, fmt.Errorf("unmarshal: %w", err)
	}

	ds, err := d.client.DataSourceByUID(input.datasourceUID)
	if err != nil {
		return backend.DataResponse{}, fmt.Errorf("fetch datasource by UID: %w", err)
	}

	dataResp := backend.DataResponse{
		Frames: []*data.Frame{
			data.NewFrame(
				"datasource",
				data.NewField("uid", nil, ds.UID),
				data.NewField("name", nil, ds.Name),
			),
		},
	}
	return dataResp, nil

}

// CheckHealth performs a request to the specified data source and returns an error if the HTTP handler did not return
// a 200 OK response.
func (d *Datasource) CheckHealth(ctx context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	_, err := d.client.Health()
	if err != nil {
		return newHealthCheckErrorf("could not check health"), nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working",
	}, nil
}

// newHealthCheckErrorf returns a new *backend.CheckHealthResult with its status set to backend.HealthStatusError
// and the specified message, which is formatted with Sprintf.
func newHealthCheckErrorf(format string, args ...interface{}) *backend.CheckHealthResult {
	return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: fmt.Sprintf(format, args...)}
}
