package scenario

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func NewDataFrame(query backend.DataQuery) *data.Frame {
	switch query.QueryType {
	case TimeSeries:
		return newTimeSeriesFrame(query)
	case Table:
		return newTableFrame(query)
	}

	return nil
}
