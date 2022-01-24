package scenario

import (
	"fmt"
	"strings"
)

type ScenarioType int8

const (
	TimeSeries ScenarioType = iota
	Table
)

var scenarios = [...]string{
	"TimeSeries",
	"Table",
}

func (st ScenarioType) String() string {
	if TimeSeries <= st && st <= Table {
		return scenarios[st]
	}
	return fmt.Sprintf("%%!ScenarioType(%d)", st)
}

func (st *ScenarioType) UnmarshalJSON(b []byte) error {
	str := strings.Trim(string(b), `"`)

	switch str {
	case TimeSeries.String():
		*st = TimeSeries
	case Table.String():
		*st = Table
	default:
		return fmt.Errorf("scenario %s not supported", str)
	}

	return nil
}
