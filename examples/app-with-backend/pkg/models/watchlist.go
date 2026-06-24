package models

import (
	"errors"
	"strings"
)

// WatchlistSpec is the user-authored body of a Watchlist stored object. It is
// the type the schema artifact reflects into the plugin schema's StoredObjects
// list, and the type carried in admission requests for the "Watchlist" kind.
type WatchlistSpec struct {
	// Title is the human-readable name of the watchlist. Required.
	Title string `json:"title"`

	// Patterns are the match patterns the watchlist enforces. At least one is
	// required.
	Patterns []string `json:"patterns"`

	// Severity is one of "info", "warn", "crit". Defaults to "info" when empty
	// (filled in by Mutate).
	Severity string `json:"severity,omitempty"`
}

var validSeverities = map[string]struct{}{
	"info": {},
	"warn": {},
	"crit": {},
}

// Validate enforces invariants on a watchlist spec. Returns nil when the spec
// is acceptable; otherwise the error message is surfaced to the API caller.
func (w *WatchlistSpec) Validate() error {
	if strings.TrimSpace(w.Title) == "" {
		return errors.New("watchlist title is required")
	}
	if len(w.Patterns) == 0 {
		return errors.New("watchlist must declare at least one pattern")
	}
	for i, p := range w.Patterns {
		if strings.TrimSpace(p) == "" {
			return errors.New("watchlist patterns must not be empty")
		}
		w.Patterns[i] = strings.TrimSpace(p)
	}
	if w.Severity != "" {
		if _, ok := validSeverities[w.Severity]; !ok {
			return errors.New(`watchlist severity must be one of "info", "warn", "crit"`)
		}
	}
	return nil
}

// Mutate applies defaults to a watchlist spec on create/update. The returned
// value is the canonical form persisted by Grafana. The receiver is not
// modified.
func (w *WatchlistSpec) Mutate() *WatchlistSpec {
	out := *w
	if out.Severity == "" {
		out.Severity = "info"
	}
	out.Title = strings.TrimSpace(out.Title)
	return &out
}
