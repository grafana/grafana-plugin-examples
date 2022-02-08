package scenario

import (
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func timeStampsBetween(timeRange backend.TimeRange, numOfPoints int) []time.Time {
	diff := timeRange.Duration()
	interval := diff.Nanoseconds() / int64(numOfPoints)
	timeStamps := make([]time.Time, numOfPoints)

	for i := range timeStamps {
		duration := time.Duration(interval * int64(i))
		pos := numOfPoints - 1 - i
		timeStamps[pos] = timeRange.From.Add(duration)
	}

	return timeStamps
}
