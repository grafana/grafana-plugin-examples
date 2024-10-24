package plugin

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/grafana/datasource-http-backend/pkg/kinds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// convertQuery parses a given DataQuery and migrates it if necessary.
func convertQuery(orig backend.DataQuery) (*kinds.DataQuery, error) {
	input := &kinds.DataQuery{}
	err := json.Unmarshal(orig.JSON, input)
	if err != nil {
		return nil, fmt.Errorf("unmarshal: %w", err)
	}
	if input.Multiplier != 0 && input.Multiply == 0 {
		input.Multiply = input.Multiplier
		input.Multiplier = 0
	}
	return input, nil
}

// convertQueryRequest migrates a given QueryDataRequest which can contain multiple queries.
func convertQueryRequest(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryConversionResponse, error) {
	queries := make([]any, 0, len(req.Queries))
	for _, q := range req.Queries {
		input, err := convertQuery(q)
		if err != nil {
			return nil, err
		}
		q.JSON, err = json.Marshal(input)
		if err != nil {
			return nil, fmt.Errorf("marshal: %w", err)
		}
		queries = append(queries, q)
	}
	return &backend.QueryConversionResponse{
		Queries: queries,
	}, nil
}
