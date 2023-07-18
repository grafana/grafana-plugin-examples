package plugin

import (
	"context"
	"encoding/json"
	"math/rand"
	"path"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

var Logger = log.DefaultLogger

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces- only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
	_ backend.StreamHandler         = (*Datasource)(nil) // Streaming data source needs to implement this
)

// NewDatasource creates a new datasource instance.
func NewDatasource(s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	return &Datasource{
		channelPrefix: path.Join("ds", s.UID),
		tickInterval:  time.Duration(1000 * time.Millisecond),
	}, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	channelPrefix string
	upperLimit    float64
	lowerLimit    float64
	tickInterval  time.Duration
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
	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		if err := d.parseQuery(q.JSON); err != nil {
			response.Responses[q.RefID] = backend.DataResponse{}
			continue
		}

		// this part allow the creation of a streaming channel
		res := d.createChannelResponse()

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

func (d *Datasource) parseQuery(rawQuery json.RawMessage) error {
	var q Query
	if err := json.Unmarshal(rawQuery, &q); err != nil {
		return err
	}

	// simple validation of provided parameters
	if q.UpperLimit > q.LowerLimit {
		d.upperLimit = q.UpperLimit
		d.lowerLimit = q.LowerLimit
	}

	if q.TickInterval > 0 {
		d.tickInterval = time.Duration(q.TickInterval) * time.Millisecond
	}

	return nil
}

// createChannelResponse creates a Channel in to be returned in the
// Frameta. It's bery important that the channel followns the format
// /ds/<plugin-id>/<channel-name>
func (d *Datasource) createChannelResponse() backend.DataResponse {
	var response backend.DataResponse

	frame := data.NewFrame("")
	frame.SetMeta(&data.FrameMeta{
		Channel: path.Join(d.channelPrefix, "my-streaming-channel"),
	})

	response.Frames = append(response.Frames, frame)
	return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Data source is working"

	if rand.Int()%2 == 0 {
		status = backend.HealthStatusError
		message = "randomized error"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}

func (d *Datasource) SubscribeStream(context.Context, *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	return &backend.SubscribeStreamResponse{
		Status: backend.SubscribeStreamStatusOK,
	}, nil
}

func (d *Datasource) PublishStream(context.Context, *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	return &backend.PublishStreamResponse{
		Status: backend.PublishStreamStatusPermissionDenied,
	}, nil
}

func (d *Datasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {
	s := rand.NewSource(time.Now().UnixNano())
	r := rand.New(s)

	ticker := time.NewTicker(d.tickInterval)

	for {
		select {
		case <-ctx.Done():
			ticker.Stop()
			return nil
		case <-ticker.C:
			randomValue := r.Float64()*(d.upperLimit-d.lowerLimit) + d.lowerLimit
			sender.SendFrame(
				data.NewFrame(
					"response",
					data.NewField("time", nil, []time.Time{time.Now()}),
					data.NewField("value", nil, []float64{randomValue})),
				data.IncludeAll,
			)
		}
	}
}
