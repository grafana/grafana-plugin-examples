package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

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

type Datasource struct {
	// tracer is a trace.Tracer instance that can be used to create traces.
	tracer trace.Tracer

	// httpClient is a dummy *http.Client with a tracing middleware attached to it.
	// The client is unused, and it's present for demonstration purposes only.
	httpClient *http.Client
}

func NewDatasource(settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	// Initialize the tracer
	tracer := otel.Tracer("plugin")

	// Create an example HTTP client that will create spans for each outgoing request.
	// This is unused in this plugin and is present only to demonstrate how to attach the tracing middleware.
	opts, err := settings.HTTPClientOptions()
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}
	// opts.WithTracingMiddleware adds a middleware that will create spans for every outgoing request.
	httpCl, err := httpclient.New(opts.WithTracingMiddleware(tracer))
	if err != nil {
		return nil, fmt.Errorf("httpclient new: %w", err)
	}

	return &Datasource{
		tracer:     tracer,
		httpClient: httpCl,
	}, nil
}

func (d *Datasource) Dispose() {
	d.httpClient.CloseIdleConnections()
}

func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// Spans are created automatically for QueryData

	// The span's context is in the ctx, you can get it with trace.SpanContextFromContext(ctx):
	sctx := trace.SpanContextFromContext(ctx)
	log.DefaultLogger.Info("QueryData", "traceID", sctx.TraceID().String(), "spanID", sctx.SpanID().String())

	response := backend.NewQueryDataResponse()
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type queryModel struct{}

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	// Create spans for this function. Refer to OpenTelemetry's Go SDK to know how to use it.
	ctx, span := d.tracer.Start(
		ctx,
		"query processing",
		trace.WithAttributes(attribute.String("my_plugin.query.ref_id", query.RefID)),
	)
	defer span.End()

	sctx := trace.SpanContextFromContext(ctx)
	log.DefaultLogger.Info("query", "traceID", sctx.TraceID().String(), "spanID", sctx.SpanID().String())

	// Simulate random slow processing
	if rand.Int()%2 == 0 {
		time.Sleep(randomDuration(5, 10))
	}

	// Return a dummy response
	var response backend.DataResponse
	var qm queryModel
	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}
	frame := data.NewFrame("response")
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, []time.Time{query.TimeRange.From, query.TimeRange.To}),
		data.NewField("values", nil, []int64{10, 20}),
	)
	response.Frames = append(response.Frames, frame)
	return response
}

func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	// Spans are created automatically for CheckHealth
	sctx := trace.SpanContextFromContext(ctx)
	log.DefaultLogger.Info("CheckHealth", "traceID", sctx.TraceID().String(), "spanID", sctx.SpanID().String())

	if err := d.contactExternalService(ctx); err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "Could not contact external service",
		}, nil
	}
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working",
	}, nil
}

func (d *Datasource) contactExternalService(ctx context.Context) error {
	ctx, span := d.tracer.Start(ctx, "External Service Call")
	defer span.End()

	// Simulate some slow external service
	time.Sleep(randomDuration(1, 2))
	span.AddEvent("connect")

	time.Sleep(randomDuration(3, 5))
	span.AddEvent("process")

	// Simulate random service failure
	if rand.Int()%2 == 0 {
		err := errors.New("external service failure")
		span.RecordError(err)
		return err
	}

	time.Sleep(randomDuration(1, 2))
	span.AddEvent("response")
	return nil
}

func randomDuration(minSeconds, maxSeconds int) time.Duration {
	return time.Millisecond * time.Duration((rand.Int()%int(math.Abs(float64(maxSeconds*1000-minSeconds*1000))))+minSeconds)
}
