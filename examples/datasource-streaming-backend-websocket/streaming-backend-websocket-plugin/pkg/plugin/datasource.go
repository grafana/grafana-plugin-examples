package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"path"
	"time"

	"github.com/grafana/example-websocket-datasource/pkg/websocket"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

var Logger = log.DefaultLogger

type WebsocketClient interface {
	Read(ctx context.Context) <-chan string
	Close()
	SendMessage(string) error
	IsConnected() bool
}

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
	settings, err := getDatasourceSettings(s)
	if err != nil {
		return nil, err
	}

	c, err := websocket.NewClient(settings.URI)
	if err != nil {
		return nil, err
	}
	return &Datasource{
		channelPrefix: path.Join("ds", s.UID),
		wsClient:      c,
		lowerLimit:    0,
		upperLimit:    1,
	}, nil
}

func getDatasourceSettings(s backend.DataSourceInstanceSettings) (*websocket.Options, error) {
	settings := &websocket.Options{}

	if err := json.Unmarshal(s.JSONData, settings); err != nil {
		return nil, err
	}

	return settings, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	channelPrefix string
	upperLimit    float64
	lowerLimit    float64
	wsClient      WebsocketClient
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
	d.wsClient.Close()
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
			response.Responses[q.RefID] = backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("parse query: %s", err))
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

	return nil
}

// createChannelResponse creates a Channel to be returned in the
// Frame meta. It's very important that the channel follows the format
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
	var message = "Connection successfully established"

	if !d.wsClient.IsConnected() {
		status = backend.HealthStatusError
		message = "Connection not working"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}

// SubscribeStream just returns an ok in this case, since we will always allow the user to successfully connect
// permissions verifications could be done here. Check backend.StreamHandler docs for more details.
func (d *Datasource) SubscribeStream(context.Context, *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	return &backend.SubscribeStreamResponse{
		Status: backend.SubscribeStreamStatusOK,
	}, nil
}

// PublishStream just returns permission denied in this case, since in this example we don't want the user to send stream data
// permissions verifications could be done here. Check backend.StreamHandler docs for more details.
func (d *Datasource) PublishStream(context.Context, *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	return &backend.PublishStreamResponse{
		Status: backend.PublishStreamStatusPermissionDenied,
	}, nil
}

func (d *Datasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {
	messages := d.wsClient.Read(ctx)

	for {
		select {
		case <-ctx.Done():
			d.wsClient.Close()
			return ctx.Err()
		case rawMsg := <-messages:
			var msg Message
			if err := json.Unmarshal([]byte(rawMsg), &msg); err != nil {
				Logger.Error("Failed to unmarshal message", "error", err)
			}

			value := msg.Value*(d.upperLimit-d.lowerLimit) + d.lowerLimit

			err := sender.SendFrame(
				data.NewFrame(
					"response",
					data.NewField("time", nil, []time.Time{time.UnixMilli(msg.Time)}),
					data.NewField("value", nil, []float64{value})),
				data.IncludeAll,
			)

			if err != nil {
				Logger.Error("Failed send frame", "error", err)
			}
		}
	}
}
