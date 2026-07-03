package models

import (
	"errors"
	"strings"
)

// FooSpec is the user-authored body of a Foo stored object. It is the type the
// schema artifact reflects into the plugin schema's StoredObjects list, and the
// type this plugin's Validate/Mutate hooks receive whenever a Foo is written.
type FooSpec struct {
	// Title is the human-readable name of the Foo. Required.
	Title string `json:"title"`

	// Items are arbitrary values owned by the Foo. At least one is required.
	Items []string `json:"items"`

	// Size is one of "small", "medium", "large". Defaults to "small" when
	// empty (filled in by Mutate).
	Size string `json:"size,omitempty"`
}

// FooStatus is the plugin-written status of a Foo stored object. Unlike the
// spec, it is never authored by users: the plugin backend reports current
// state here.
type FooStatus struct {
	// State is the current evaluation state of the Foo.
	State string `json:"state,omitempty"`

	// Message is a human-readable explanation of the current state.
	Message string `json:"message,omitempty"`
}

var validSizes = map[string]struct{}{
	"small":  {},
	"medium": {},
	"large":  {},
}

// Validate enforces invariants on a Foo spec. Returns nil when the spec
// is acceptable; otherwise the error message is surfaced to the API caller.
func (f *FooSpec) Validate() error {
	if strings.TrimSpace(f.Title) == "" {
		return errors.New("foo title is required")
	}
	if len(f.Items) == 0 {
		return errors.New("foo must declare at least one item")
	}
	for _, item := range f.Items {
		if strings.TrimSpace(item) == "" {
			return errors.New("foo items must not be empty")
		}
	}
	if f.Size != "" {
		if _, ok := validSizes[f.Size]; !ok {
			return errors.New(`foo size must be one of "small", "medium", "large"`)
		}
	}
	return nil
}

// Mutate applies defaults to a Foo spec on create, modifying the receiver in
// place. Returns an error only if a mutation cannot be completed (none today,
// but the signature reserves space).
func (f *FooSpec) Mutate() error {
	if f.Size == "" {
		f.Size = "small"
	}
	f.Title = strings.TrimSpace(f.Title)
	for i := range f.Items {
		f.Items[i] = strings.TrimSpace(f.Items[i])
	}
	return nil
}
