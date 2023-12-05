package plugin

import (
	"fmt"
	"net/http"

	gapi "github.com/grafana/grafana-api-golang-client"
)

func newGrafanaClient(c *http.Client, s Settings) (*gapi.Client, error) {
	gc, err := gapi.New(s.GrafanaURL, gapi.Config{
		APIKey: s.GrafanaAPIKey,
		Client: c,
	})
	if err != nil {
		return nil, fmt.Errorf("creating grafana client: %w", err)
	}

	return gc, nil
}
