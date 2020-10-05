package main

import (
	"context"
	"encoding/json"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// queryModel defines the query sent from Grafana. This typically matches the
// query that's defined in `src/types.ts`.
type queryModel struct {
	Constant  float64 `json:"constant"`
	QueryText string  `json:"queryText"`
}

type dataSource struct{}

func (ds *dataSource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	responses := make(backend.Responses)

	for _, q := range req.Queries {
		responses[q.RefID] = ds.query(ctx, q)
	}

	return &backend.QueryDataResponse{
		Responses: responses,
	}, nil
}

// query is a helper that performs the actual data source query.
func (ds *dataSource) query(ctx context.Context, query backend.DataQuery) backend.DataResponse {
	var model queryModel
	if err := json.Unmarshal(query.JSON, &model); err != nil {
		return backend.DataResponse{Error: err}
	}

	return backend.DataResponse{
		Frames: []*data.Frame{{
			Name: "http_request_total",
			Fields: []*data.Field{
				data.NewField("Time", nil, []time.Time{query.TimeRange.From, query.TimeRange.To}),
				data.NewField("Values", nil, []float64{model.Constant, model.Constant}),
			},
		}},
	}
}

// CheckHealth returns the current health of the backend.
func (ds *dataSource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Success",
	}, nil
}
