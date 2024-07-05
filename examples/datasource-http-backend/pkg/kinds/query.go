package kinds

import (
	"embed"
	"encoding/json"
)

type DataQuery struct {
	Multiplier int `json:"multiplier"`
}

//go:embed query.types.json
var f embed.FS

// QueryTypeDefinitionListJSON returns the query type definitions
func QueryTypeDefinitionListJSON() (json.RawMessage, error) {
	return f.ReadFile("query.types.json")
}
