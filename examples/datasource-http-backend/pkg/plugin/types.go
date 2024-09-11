package plugin

import (
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/experimental/apis/data/v0alpha1"
)

// apiMetrics is a struct containing a slice of dataPoint
type apiMetrics struct {
	DataPoints []apiDataPoint `json:"datapoints"`
}

// apiDataPoint is a single data point with a timestamp and a float value
type apiDataPoint struct {
	Time  time.Time `json:"time"`
	Value float64   `json:"value"`
}

type apiQuery struct {
	v0alpha1.CommonQueryProperties

	Multiply      int    `json:"multiply"`
	PluginVersion string `json:"pluginVersion"`
}

type apiQueryV1 struct {
	Multiplier int `json:"multiplier"`
}
