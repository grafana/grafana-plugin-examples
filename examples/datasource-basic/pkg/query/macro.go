package query

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/grafana/basic-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

//  Macros:
//   - $__timeFilter() -> defaultTimeColumn ≥ datetime(2018-06-05T18:09:58.907Z) and defaultTimeColumn ≤ datetime(2018-06-05T20:09:58.907Z)
//   - $__timeFilter(datetimeColumn) ->  datetimeColumn  ≥ datetime(2018-06-05T18:09:58.907Z) and datetimeColumn ≤ datetime(2018-06-05T20:09:58.907Z)

// queryMacro contains the information needed for macro expansion.
type queryMacro struct {
	backend.TimeRange
	defaultTimeColumn string
}

// NewQueryMacro creates a QueryMacro object from the arguments that
// can be used to interpolate macros with the Interpolate method.
func newQueryMacro(settings models.PluginSettings, tr backend.TimeRange) queryMacro {
	return queryMacro{
		TimeRange:         tr,
		defaultTimeColumn: settings.DefaultTimeField,
	}
}

// macroRE is a regular expression to match available macros
var macroRE = regexp.MustCompile(`\$__` + // Prefix: $__
	`(timeFilter)` + // one of macro root names
	`(\([a-zA-Z0-9_\s.-]*?\))?`) // optional () or optional (someArg)

// Interpolate replaces macros with their values for the given query.
func (qm queryMacro) Interpolate(query string) (string, error) {
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
		if len(varSplit) > 1 {
			arg = varSplit[1]
		}
		return funcToCall(arg, qm)
	}
	interpolated := macroRE.ReplaceAllStringFunc(query, replaceAll)
	if len(errorStrings) > 0 {
		return "", fmt.Errorf("failed to interpolate query, errors: %v", strings.Join(errorStrings, "\n"))
	}
	return interpolated, nil
}

var interpolationFuncs = map[string]func(string, queryMacro) string{
	"$__timeFilter": timeFilterMacro,
}

func timeFilterMacro(s string, qm queryMacro) string {
	if s == "" {
		s = qm.defaultTimeColumn
	}
	fmtString := "%v >= datetime(%v) and %v <= datetime(%v)"
	timeString := fmt.Sprintf(fmtString, s, qm.From.UTC().Format(time.RFC3339Nano), s, qm.To.UTC().Format(time.RFC3339Nano))
	backend.Logger.Debug("Time String", "value", timeString)
	return timeString
}
