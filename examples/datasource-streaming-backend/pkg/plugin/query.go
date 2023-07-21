package plugin

type Query struct {
	UpperLimit   string `json:"upperLimit"`
	LowerLimit   string `json:"lowerLimit"`
	TickInterval string `json:"tickInterval"`
}
