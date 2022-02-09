package scenario

import (
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func NewDataFrame(query backend.DataQuery) (*data.Frame, error) {
	switch query.QueryType {
	case TimeSeries:
		return newTimeSeriesFrame(query)
	case Table:
		return newTableFrame(query)
	}

	return nil, fmt.Errorf("queryType not supported %s", query.QueryType)
}
