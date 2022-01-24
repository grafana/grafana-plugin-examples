package scenario

import "time"

func timeStampsBetween(from time.Time, to time.Time, numOfPoints int) []time.Time {
	diff := from.Sub(to)
	interval := diff.Milliseconds() / int64(numOfPoints)
	timeStamps := make([]time.Time, numOfPoints)

	for i := range timeStamps {
		duration := time.Duration(interval * int64(i))
		timeStamps[i] = from.Add(duration)
	}

	return timeStamps
}
