package scenario

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// Example on how you can structure your data frames when returning
// table based data.
func newTableFrame(query backend.DataQuery) *data.Frame {
	tempInside := []int64{25, 22, 19, 23, 22, 22, 18, 26, 24, 20}
	tempOutside := []int64{10, 8, 12, 9, 10, 11, 10, 9, 10, 9}
	timestamps := timeStampsBetween(query.TimeRange, len(tempOutside))

	fields := []*data.Field{
		data.NewField("time", nil, timestamps),
		data.NewField("temperature", data.Labels{"sensor": "outside"}, tempOutside),
		data.NewField("temperature", data.Labels{"sensor": "inside"}, tempInside),
	}

	return data.NewFrame("temperatures", fields...)
}
