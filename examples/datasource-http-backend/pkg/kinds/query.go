package kinds

import (
	"embed"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/experimental/apis/data/v0alpha1"
)

type DataQuery struct {
	v0alpha1.CommonQueryProperties

	// Multiply is the number to multiply the input by
	Multiply int `json:"multiply,omitempty"`

	// Deprecated: Use Multiply instead
	Multiplier int `json:"multiplier,omitempty"`
}

//go:embed query.types.json
var f embed.FS

// QueryTypeDefinitionListJSON returns the query type definitions
func QueryTypeDefinitionListJSON() (json.RawMessage, error) {
	return f.ReadFile("query.types.json")
}
