package admission

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"

	"github.com/myorg/backend/pkg/models"
)

// Handler implements backend.AdmissionHandler for the kinds this plugin owns.
// Dispatch is by Kind only; the gRPC request carries the full envelope as
// bytes so we unmarshal the spec into a typed struct and call its Validate /
// Mutate methods.
type Handler struct{}

var _ backend.AdmissionHandler = (*Handler)(nil)

// ValidateAdmission decodes the incoming object, dispatches on Kind, and
// returns Allowed=true when the typed Validate accepts the spec.
func (h *Handler) ValidateAdmission(_ context.Context, req *backend.AdmissionRequest) (*backend.ValidationResponse, error) {
	switch req.Kind.Kind {
	case "Watchlist":
		var obj envelope[models.WatchlistSpec]
		if err := json.Unmarshal(req.ObjectBytes, &obj); err != nil {
			return denied(fmt.Sprintf("decoding Watchlist: %v", err)), nil
		}
		if err := obj.Spec.Validate(); err != nil {
			return denied(err.Error()), nil
		}
		return &backend.ValidationResponse{Allowed: true}, nil
	default:
		return denied(fmt.Sprintf("unknown kind %q", req.Kind.Kind)), nil
	}
}

// MutateAdmission decodes the object, applies type-specific defaults, and
// returns the canonical bytes.
func (h *Handler) MutateAdmission(_ context.Context, req *backend.AdmissionRequest) (*backend.MutationResponse, error) {
	switch req.Kind.Kind {
	case "Watchlist":
		var obj envelope[models.WatchlistSpec]
		if err := json.Unmarshal(req.ObjectBytes, &obj); err != nil {
			return mutationDenied(fmt.Sprintf("decoding Watchlist: %v", err)), nil
		}
		if err := obj.Spec.Validate(); err != nil {
			return mutationDenied(err.Error()), nil
		}
		mutated := obj.Spec.Mutate()
		obj.Spec = *mutated
		out, err := json.Marshal(&obj)
		if err != nil {
			return nil, fmt.Errorf("marshaling mutated Watchlist: %w", err)
		}
		return &backend.MutationResponse{Allowed: true, ObjectBytes: out}, nil
	default:
		return mutationDenied(fmt.Sprintf("unknown kind %q", req.Kind.Kind)), nil
	}
}

// envelope is a minimal kubernetes-style envelope around a typed spec. We
// intentionally keep metadata as a passthrough RawMessage rather than reaching
// into k8s.io/api/core to avoid pulling that in to the plugin.
type envelope[T any] struct {
	APIVersion string          `json:"apiVersion,omitempty"`
	Kind       string          `json:"kind,omitempty"`
	Metadata   json.RawMessage `json:"metadata,omitempty"`
	Spec       T               `json:"spec"`
}

func denied(message string) *backend.ValidationResponse {
	return &backend.ValidationResponse{
		Allowed: false,
		Result: &backend.StatusResult{
			Status:  "Failure",
			Message: message,
			Reason:  "Invalid",
			Code:    400,
		},
	}
}

func mutationDenied(message string) *backend.MutationResponse {
	return &backend.MutationResponse{
		Allowed: false,
		Result: &backend.StatusResult{
			Status:  "Failure",
			Message: message,
			Reason:  "Invalid",
			Code:    400,
		},
	}
}
