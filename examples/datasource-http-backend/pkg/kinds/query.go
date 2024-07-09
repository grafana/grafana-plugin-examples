package kinds

import (
	"embed"
	"encoding/json"
)

type DataQuery struct {
	// Deprecated: Moved to Multiply, made optional
	Multiplier int `json:"multiplier,omitempty"`
	// Multiply is the number to multiply the input by
	Multiply int `json:"multiply,omitempty"`
}

//go:embed query.types.json
var f embed.FS

// QueryTypeDefinitionListJSON returns the query type definitions
func QueryTypeDefinitionListJSON() (json.RawMessage, error) {
	return f.ReadFile("query.types.json")
}
