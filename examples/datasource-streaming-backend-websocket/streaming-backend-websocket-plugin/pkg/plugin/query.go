package plugin

type Query struct {
	UpperLimit   float64 `json:"upperLimit"`
	LowerLimit   float64 `json:"lowerLimit"`
	TickInterval float64 `json:"tickInterval"`
}
