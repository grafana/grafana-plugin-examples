package plugin

import (
	"context"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// Settings (JSON + secure JSON)
type Settings struct {
	GrafanaURL string `json:"grafanaURL"`

	// Loaded from SecureJSON
	GrafanaAPIKey string `json:"-"` // secure json
}

// loadSettings will read and validate Settings from DataSourceInstanceSettings
func loadSettings(ctx context.Context, s backend.DataSourceInstanceSettings) (Settings, error) {
	gCfg := backend.GrafanaConfigFromContext(ctx)

	appURL, err := gCfg.AppURL()
	if err != nil {
		return Settings{}, err
	}

	return Settings{
		GrafanaURL:    appURL,
		GrafanaAPIKey: s.DecryptedSecureJSONData["grafanaAPIKey"],
	}, nil
}
