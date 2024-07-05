package kinds

import (
	"embed"
	"encoding/json"
)

// // NodesQueryType defines model for NodesQuery.Type.
// // +enum
// type NodesQueryType string

// const (
// 	NodesQueryTypeRandom          NodesQueryType = "random"
// 	NodesQueryTypeRandomEdges     NodesQueryType = "random edges"
// 	NodesQueryTypeResponseMedium  NodesQueryType = "response_medium"
// 	NodesQueryTypeResponseSmall   NodesQueryType = "response_small"
// 	NodesQueryTypeFeatureShowcase NodesQueryType = "feature_showcase"
// )

type DataQuery struct {
	Multiplier int `json:"multiplier"`

	// Nodes     *NodesQuery      `json:"nodes,omitempty"`
}

// NodesQuery defines model for NodesQuery.
/* type NodesQuery struct {
	Count int64          `json:"count,omitempty"`
	Seed  int64          `json:"seed,omitempty"`
	Type  NodesQueryType `json:"type,omitempty"`
	Test  string         `json:"test,omitempty"`
}
*/

//go:embed query.types.json
var f embed.FS

// QueryTypeDefinitionListJSON returns the query type definitions
func QueryTypeDefinitionListJSON() (json.RawMessage, error) {
	return f.ReadFile("query.types.json")
}
