package plugin

import (
	"context"
	"testing"
	"time"

	"github.com/grafana/basic-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestQueryData(t *testing.T) {
	ds := Datasource{
		settings: &models.PluginSettings{},
	}
	json := []byte(`{
		"scenario": "TimeSeries"
	}`)
	timeRange := backend.TimeRange{
		From: time.Date(2022, 1, 1, 10, 0, 0, 0, time.UTC),
		To:   time.Date(2022, 1, 1, 11, 0, 0, 0, time.UTC),
	}

	resp, err := ds.QueryData(
		context.Background(),
		&backend.QueryDataRequest{
			Queries: []backend.DataQuery{
				{
					RefID:     "A",
					JSON:      json,
					TimeRange: timeRange,
				},
			},
		},
	)
	if err != nil {
		t.Error(err)
	}

	if len(resp.Responses) != 1 {
		t.Fatal("QueryData must return a response")
	}
}
