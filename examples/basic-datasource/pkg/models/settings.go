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

const TIME_FIELD = "time"

func LoadPluginSettings(source backend.DataSourceInstanceSettings) (*PluginSettings, error) {
	if source.JSONData == nil || len(source.JSONData) < 1 {
		// If no settings have been saved return default values
		return &PluginSettings{
			DefaultTimeField: TIME_FIELD,
			Secrets:          loadSecretPluginSettings(source.DecryptedSecureJSONData),
		}, nil
	}

	var settings PluginSettings

	err := json.Unmarshal(source.JSONData, &settings)
	if err != nil {
		return nil, fmt.Errorf("could not unmarshal PluginSettings json: %w", err)
	}

	if settings.DefaultTimeField == "" {
		settings.DefaultTimeField = TIME_FIELD
	}

	settings.Secrets = loadSecretPluginSettings(source.DecryptedSecureJSONData)
	return &settings, nil
}

func loadSecretPluginSettings(source map[string]string) *SecretPluginSettings {
	return &SecretPluginSettings{
		ApiKey: source["apiKey"],
	}
}
