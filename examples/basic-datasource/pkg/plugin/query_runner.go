package plugin

import (
	"context"
	"encoding/json"

	"github.com/grafana/basic-datasource/pkg/scenario"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type queryModel struct {
	Scenario scenario.ScenarioType `json:"scenario"`
}

func runQuery(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	// create data frame response from given scenario.
	frame, err := scenario.NewScenarioFrame(qm.Scenario, query)
	if err != nil {
		response.Error = err
		return response
	}

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}
