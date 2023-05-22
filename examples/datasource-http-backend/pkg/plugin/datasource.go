package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
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
func NewDatasource(settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	opts, err := settings.HTTPClientOptions()
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
	return &Datasource{
		settings:   settings,
		httpClient: cl,
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
	settings backend.DataSourceInstanceSettings

	httpClient *http.Client
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
	d.httpClient.CloseIdleConnections()
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// Spans are created automatically for QueryData and all other plugin interface methods.
	// The span's context is in the ctx, you can get it with trace.SpanContextFromContext(ctx)
	sctx := trace.SpanContextFromContext(ctx)
	log.DefaultLogger.Debug("QueryData", "traceID", sctx.TraceID().String(), "spanID", sctx.SpanID().String())

	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for i, q := range req.Queries {
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

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) (backend.DataResponse, error) {
	// Create spans for this function.
	// tracing.DefaultTracer() returns the tracer initialized when calling Manage().
	// Refer to OpenTelemetry's Go SDK to know how to customize your spans.
	ctx, span := tracing.DefaultTracer().Start(
		ctx,
		"query processing",
		trace.WithAttributes(
			attribute.String("query.ref_id", query.RefID),
			attribute.String("query.type", query.QueryType),
			attribute.Int64("query.max_data_points", query.MaxDataPoints),
			attribute.Int64("query.interval_ms", query.Interval.Milliseconds()),
			attribute.Int64("query.time_range.from", query.TimeRange.From.Unix()),
			attribute.Int64("query.time_range.to", query.TimeRange.To.Unix()),
		),
	)
	defer span.End()

	// Do HTTP request
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, d.settings.URL, nil)
	if err != nil {
		return backend.DataResponse{}, fmt.Errorf("new request with context: %w", err)
	}
	if len(query.JSON) > 0 {
		input := &apiQuery{}
		err = json.Unmarshal(query.JSON, input)
		if err != nil {
			return backend.DataResponse{}, fmt.Errorf("unmarshal: %w", err)
		}
		q := req.URL.Query()
		q.Add("multiplier", strconv.Itoa(input.Multiplier))
		req.URL.RawQuery = q.Encode()
	}
	httpResp, err := d.httpClient.Do(req)
	switch {
	case err == nil:
		break
	case errors.Is(err, context.DeadlineExceeded):
		return backend.DataResponse{}, err
	default:
		return backend.DataResponse{}, fmt.Errorf("http client do: %w: %s", errRemoteRequest, err)
	}
	defer func() {
		if err := httpResp.Body.Close(); err != nil {
			log.DefaultLogger.Error("query: failed to close response body", "err", err)
		}
	}()
	span.AddEvent("HTTP request done")

	// Make sure the response was successful
	if httpResp.StatusCode != http.StatusOK {
		return backend.DataResponse{}, fmt.Errorf("%w: expected 200 response, got %d", errRemoteResponse, httpResp.StatusCode)
	}

	// Decode response
	var body apiMetrics
	if err := json.NewDecoder(httpResp.Body).Decode(&body); err != nil {
		return backend.DataResponse{}, fmt.Errorf("%w: decode: %s", errRemoteRequest, err)
	}
	span.AddEvent("JSON response decoded")

	// Create slice of values for time and values.
	times := make([]time.Time, len(body.DataPoints))
	values := make([]float64, len(body.DataPoints))
	for i, p := range body.DataPoints {
		times[i] = p.Time
		values[i] = p.Value
	}
	span.AddEvent("Datapoints created")

	// Create frame and add it to the response
	dataResp := backend.DataResponse{
		Frames: []*data.Frame{
			data.NewFrame(
				"response",
				data.NewField("time", nil, times),
				data.NewField("values", nil, values),
			),
		},
	}
	span.AddEvent("Frames created")
	return dataResp, err
}

// CheckHealth performs a request to the specified data source and returns an error if the HTTP handler did not return
// a 200 OK response.
func (d *Datasource) CheckHealth(ctx context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	r, err := http.NewRequestWithContext(ctx, http.MethodGet, d.settings.URL, nil)
	if err != nil {
		return newHealthCheckErrorf("could not create request"), nil
	}
	resp, err := d.httpClient.Do(r)
	if err != nil {
		return newHealthCheckErrorf("request error"), nil
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.DefaultLogger.Error("check health: failed to close response body", "err", err.Error())
		}
	}()
	if resp.StatusCode != http.StatusOK {
		return newHealthCheckErrorf("got response code %d", resp.StatusCode), nil
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
