package scenario

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type queryModel struct {
	Scenario ScenarioType `json:"scenario"`
}

func RunQuery(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	// create data frame response from given scenario.
	frame, err := NewScenarioFrame(qm.Scenario, query)
	if err != nil {
		response.Error = err
		return response
	}

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}
