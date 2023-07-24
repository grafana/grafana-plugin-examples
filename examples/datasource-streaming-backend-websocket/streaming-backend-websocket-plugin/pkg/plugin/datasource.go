package plugin

import (
	"context"
	"encoding/json"
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
	Connect() error
	CanConnect() bool
	Read(ctx context.Context) <-chan string
	Close()
	SendMessage(string) error
}

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces- only those which are required for a particular task.
var (
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

	c := websocket.NewClient(settings.URI)

	return &Datasource{
		channelPrefix: path.Join("ds", s.UID),
		wsClient:      c,
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
	wsClient      WebsocketClient
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
	d.wsClient.Close()
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Connection can be successfully established"

	if !d.wsClient.CanConnect() {
		status = backend.HealthStatusError
		message = "Connection not working"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}

// SubscribeStream just returns an ok in this case, since we will always allow the user to successfully connect.
// Permissions verifications could be done here. Check backend.StreamHandler docs for more details.
func (d *Datasource) SubscribeStream(_ context.Context, req *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	return &backend.SubscribeStreamResponse{
		Status: backend.SubscribeStreamStatusOK,
	}, nil
}

// PublishStream just returns permission denied in this case, since in this example we don't want the user to send stream data.
// Permissions verifications could be done here. Check backend.StreamHandler docs for more details.
func (d *Datasource) PublishStream(context.Context, *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	return &backend.PublishStreamResponse{
		Status: backend.PublishStreamStatusPermissionDenied,
	}, nil
}

func (d *Datasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {
	q := Query{}
	json.Unmarshal(req.Data, &q)

	limitsData, err := json.Marshal(q)
	if err != nil {
		return err
	}

	err = d.wsClient.Connect()
	if err != nil {
		return err
	}
	defer d.wsClient.Close()

	err = d.wsClient.SendMessage(string(limitsData))
	if err != nil {
		return err
	}

	messages := d.wsClient.Read(ctx)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case rawMsg := <-messages:
			var msg Message
			if err := json.Unmarshal([]byte(rawMsg), &msg); err != nil {
				Logger.Error("Failed to unmarshal message", "error", err)
			}

			err := sender.SendFrame(
				data.NewFrame(
					"response",
					data.NewField("time", nil, []time.Time{time.UnixMilli(msg.Time)}),
					data.NewField("value", nil, []float64{msg.Value})),
				data.IncludeAll,
			)

			if err != nil {
				Logger.Error("Failed send frame", "error", err)
			}
		}
	}
}
