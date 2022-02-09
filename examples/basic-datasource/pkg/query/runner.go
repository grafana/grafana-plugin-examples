package query

import (
	"context"
	"encoding/json"

	"github.com/grafana/basic-datasource/pkg/models"
	"github.com/grafana/basic-datasource/pkg/query/scenario"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func RunQuery(_ context.Context, settings models.PluginSettings, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm models.QueryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	// Interpolate query so it can be run against your data source if it
	// contains any macros.
	macro := newQueryMacro(settings, query.TimeRange)
	qm.RunnableQuery, response.Error = macro.Interpolate(qm.RawQuery)
	if response.Error != nil {
		return response
	}

	// We are not using the RunnableQuery in this example because we are generating
	// static data depending on the query type. We still want to show case how to
	// support macros/server side variables in your queries.
	frame := scenario.NewDataFrame(query)
	if frame == nil {
		return response
	}

	// Add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}
