package plugin

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// Settings (JSON + secure JSON)
type Settings struct {
	GrafanaURL string `json:"grafanaURL"`

	// Loaded from SecureJSON
	GrafanaAPIKey string `json:"-"` // secure json
}

// loadSettings will read and validate Settings from DataSourceInstanceSettings
func loadSettings(s backend.DataSourceInstanceSettings) (Settings, error) {
	settings := Settings{}

	if err := json.Unmarshal(s.JSONData, &settings); err != nil {
		return settings, fmt.Errorf("could not unmarshal DataSourceInfo json: %w\n%s", err, s.JSONData)
	}

	settings.GrafanaAPIKey = s.DecryptedSecureJSONData["grafanaAPIKey"]
	return settings, nil
}
