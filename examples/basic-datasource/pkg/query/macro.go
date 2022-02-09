package query

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

//  Macros:
//   - $__timeFilter() -> TimeGenerated ≥ datetime(2018-06-05T18:09:58.907Z) and TimeGenerated ≤ datetime(2018-06-05T20:09:58.907Z)
//   - $__timeFilter(datetimeColumn) ->  datetimeColumn  ≥ datetime(2018-06-05T18:09:58.907Z) and datetimeColumn ≤ datetime(2018-06-05T20:09:58.907Z)

// MacroData contains the information needed for macro expansion.
type macroContext struct {
	backend.TimeRange
}

// NewMacroData creates a MacroData object from the arguments that
// can be used to interpolate macros with the Interpolate method.
func newMacroContext(qm queryModel, tr backend.TimeRange) macroContext {
	return macroContext{
		TimeRange: tr,
	}
}

// macroRE is a regular expression to match available macros
var macroRE = regexp.MustCompile(`\$__` + // Prefix: $__
	`(timeFilter)` + // one of macro root names
	`(\([a-zA-Z0-9_\s.-]*?\))?`) // optional () or optional (someArg)

// Interpolate replaces macros with their values for the given query.
func (ctx macroContext) Interpolate(query string) (string, error) {
	errorStrings := []string{}
	replaceAll := func(varMatch string) string {
		varSplit := strings.FieldsFunc(varMatch, func(r rune) bool {
			if r == '(' || r == ')' {
				return true
			}
			return false
		})
		funcName := varSplit[0]
		funcToCall, ok := interpolationFuncs[funcName]
		if !ok {
			errorStrings = append(errorStrings, fmt.Sprintf("failed to interpolate, could not find function '%v'", funcName))
			return ""
		}
		arg := ""
		return funcToCall(arg, ctx)
	}
	interpolated := macroRE.ReplaceAllStringFunc(query, replaceAll)
	if len(errorStrings) > 0 {
		return "", fmt.Errorf("failed to interpolate query, errors: %v", strings.Join(errorStrings, "\n"))
	}
	return interpolated, nil
}

var interpolationFuncs = map[string]func(string, macroContext) string{
	"$__timeFilter": timeFilterMacro,
}

func timeFilterMacro(s string, md macroContext) string {
	if s == "" {
		s = "TimeGenerated"
	}
	fmtString := "%v >= datetime(%v) and %v <= datetime(%v)"
	timeString := fmt.Sprintf(fmtString, s, md.From.UTC().Format(time.RFC3339Nano), s, md.To.UTC().Format(time.RFC3339Nano))
	backend.Logger.Debug("Time String", "value", timeString)
	return timeString
}
