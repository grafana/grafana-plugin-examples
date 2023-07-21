package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"path"
	"strconv"
	"strings"
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
	}, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	channelPrefix string
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
		query, err := parseQuery(q.JSON)
		if err != nil {
			response.Responses[q.RefID] = backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("parse query: %s", err))
			continue
		}

		// this part allow the creation of a streaming channel
		res := d.createChannelResponse(query)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

func parseQuery(rawQuery json.RawMessage) (Query, error) {
	q := Query{
		UpperLimit:   "1",
		LowerLimit:   "0",
		TickInterval: "1000",
	} //default limits

	if err := json.Unmarshal(rawQuery, &q); err != nil {
		return q, err
	}

	return q, nil
}

// createChannelResponse creates a Channel to be returned in the
// Frame meta. It's very important that the channel follows the format
// /ds/<plugin-id>/<channel-name>
func (d *Datasource) createChannelResponse(q Query) backend.DataResponse {
	var response backend.DataResponse

	frame := data.NewFrame("")
	frame.SetMeta(&data.FrameMeta{
		Channel: path.Join(d.channelPrefix, "my-streaming-channel", q.LowerLimit, q.UpperLimit, q.TickInterval), //the path is used to send data to RunStream
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
	chunks := strings.Split(req.Path, "/")
	if len(chunks) < 4 {
		return fmt.Errorf("invalid path: %s", req.Path)
	}

	lowerLimit := parseFloat(chunks[1], 0)
	upperLimit := parseFloat(chunks[2], 1)
	tickInterval := parseFloat(chunks[3], 1000)

	s := rand.NewSource(time.Now().UnixNano())
	r := rand.New(s)

	ticker := time.NewTicker(time.Duration(tickInterval) * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// we generate a random value using the intervals provided by the frontend
			randomValue := r.Float64()*(upperLimit-lowerLimit) + lowerLimit

			err := sender.SendFrame(
				data.NewFrame(
					"response",
					data.NewField("time", nil, []time.Time{time.Now()}),
					data.NewField("value", nil, []float64{randomValue})),
				data.IncludeAll,
			)

			if err != nil {
				Logger.Error("Failed send frame", "error", err)
			}
		}
	}
}

func parseFloat(str string, fallback float64) float64 {
	value, err := strconv.ParseFloat(str, 64)
	if err != nil {
		return fallback
	}
	return value
}
