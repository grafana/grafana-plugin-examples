package query

import (
	"context"
	"encoding/json"

	"github.com/grafana/basic-datasource/pkg/scenario"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type queryModel struct {
	RawQuery      string `json:"rawQuery"`
	RunnableQuery string `json:"-"`
}

func RunQuery(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	// Interpolate query with context values.
	mc := newMacroContext(qm, query.TimeRange)
	runnableQuery, err := mc.Interpolate(qm.RawQuery)
	if err != nil {
		response.Error = err
		return response
	}

	// Interpolated query that can be executed against your data source.
	// We are not using it in this example since we only generate static
	// response based on queryType. But we still want to show case how
	// to support serverside variables/macros for your data source.
	qm.RunnableQuery = runnableQuery

	// Create data frame response from given query type.
	frame, err := scenario.NewDataFrame(query)
	if err != nil {
		response.Error = err
		return response
	}

	// Add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}
