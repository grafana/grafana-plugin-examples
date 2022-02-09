package scenario

import (
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func timeStampsBetween(timeRange backend.TimeRange, numOfPoints int) []time.Time {
	diff := timeRange.Duration()
	interval := diff.Nanoseconds() / int64(numOfPoints)
	timeStamps := make([]time.Time, numOfPoints)

	// always return the date time values as UTC from the source of your data.
	for i := range timeStamps {
		duration := time.Duration(interval * int64(i))
		timeStamps[i] = timeRange.From.Add(duration).UTC()
	}

	return timeStamps
}
