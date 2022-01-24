package scenario

import (
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func NewScenarioFrame(scenario ScenarioType, query backend.DataQuery) (*data.Frame, error) {
	switch scenario {
	case TimeSeries:
		return newTimeSeriesFrame(query)
	case Table:
		return newTableFrame(query)
	}

	return nil, fmt.Errorf("scenario not supported %s", scenario)
}
