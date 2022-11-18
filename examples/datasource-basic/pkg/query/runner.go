package query

import (
	"context"
	"encoding/json"
	"github.com/grafana/basic-datasource/pkg/models"
	"github.com/grafana/basic-datasource/pkg/query/scenario"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func RunQuery(_ context.Context, settings models.PluginSettings, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm models.QueryModel

	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, "json unmarshal: "+err.Error())
	}

	// Interpolate query so it can be run against your data source if it
	// contains any macros.
	macro := newQueryMacro(settings, query.TimeRange)
	qm.RunnableQuery, err = macro.Interpolate(qm.RawQuery)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, "macro interpolate: "+err.Error())
	}

	// We are not using the RunnableQuery in this example because we are generating
	// static data depending on the query type. We still want to show case how to
	// support macros/server side variables in your queries.
	frame := scenario.NewDataFrame(query)
	if frame == nil {
		return response
	}

	// Assign the refId from the query to the reply data frame to make it
	// easier to track.
	frame.RefID = query.RefID

	// Assign the query that where executed to make it clearer for the end user
	// what query was executed after macros have been applied.
	// NOTE! If the query contain any secret information this should be removed prior
	// to returning it.
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: qm.RunnableQuery,
	}

	// Add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}
