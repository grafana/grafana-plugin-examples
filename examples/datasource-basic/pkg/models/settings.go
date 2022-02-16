package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type PluginSettings struct {
	DefaultTimeField string                `json:"defaultTimeField"`
	Secrets          *SecretPluginSettings `json:"-"`
}

type SecretPluginSettings struct {
	ApiKey string
}

const defaultTimeField = "time"

func LoadPluginSettings(source backend.DataSourceInstanceSettings) (*PluginSettings, error) {
	if source.JSONData == nil || len(source.JSONData) < 1 {
		// If no settings have been saved return default values
		return &PluginSettings{
			DefaultTimeField: defaultTimeField,
			Secrets:          loadSecretPluginSettings(source.DecryptedSecureJSONData),
		}, nil
	}

	settings := PluginSettings{
		DefaultTimeField: defaultTimeField,
	}

	err := json.Unmarshal(source.JSONData, &settings)
	if err != nil {
		return nil, fmt.Errorf("could not unmarshal PluginSettings json: %w", err)
	}

	settings.Secrets = loadSecretPluginSettings(source.DecryptedSecureJSONData)

	return &settings, nil
}

func loadSecretPluginSettings(source map[string]string) *SecretPluginSettings {
	return &SecretPluginSettings{
		ApiKey: source["apiKey"],
	}
}
