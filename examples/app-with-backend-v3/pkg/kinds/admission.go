package kinds

import (
	"context"
	"encoding/json"

	"google.golang.org/protobuf/proto"

	pluginv3 "github.com/grafana/grafana-plugin-sdk-go/genproto/grafana/plugin/v3"
)

// ValidateAdmission dispatches to per-kind validators.
//
// manifest drift: the app-manifest-sdk.json declares which kinds admit. This
// switch has to match. Nothing catches the drift.
func ValidateAdmission(
	ctx context.Context,
	req *pluginv3.ValidateAdmissionRequest,
) (*pluginv3.ValidateAdmissionResponse, error) {
	switch req.GetKind().GetKind() {
	case "Watchlist":
		return s.validateWatchlist(ctx, req)
	default:
		// Default-open or default-closed? Both wrong sometimes.
		return allow(), nil
	}
}

func (s *Server) validateWatchlist(
	_ context.Context,
	req *pluginv3.ValidateAdmissionRequest,
) (*pluginv3.ValidateAdmissionResponse, error) {
	var w struct {
		Spec struct {
			Patterns []string `json:"patterns"`
		} `json:"spec"`
	}
	if err := json.Unmarshal(req.GetObjectBytes(), &w); err != nil {
		return deny("invalid watchlist payload"), nil
	}

	// caller identity: the request has no user info. Cannot check whether
	// the caller has permission to touch this Watchlist.

	// plugin settings: the request has no AppInstanceSettings. Cannot reach
	// the plugin's own configuration from here.

	if len(w.Spec.Patterns) == 0 {
		return deny("patterns required"), nil
	}

	return allow(), nil
}

func allow() *pluginv3.ValidateAdmissionResponse {
	return pluginv3.ValidateAdmissionResponse_builder{
		Allowed: proto.Bool(true),
	}.Build()
}

func deny(msg string) *pluginv3.ValidateAdmissionResponse {
	return pluginv3.ValidateAdmissionResponse_builder{
		Allowed: proto.Bool(false),
		Result: &pluginv3.StatusResult{
			Status:  proto.String("Failure"),
			Message: proto.String(msg),
			Code:    proto.Int32(400),
		},
	}.Build()
}
