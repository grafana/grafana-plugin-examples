// Package antipattern implements v2 and v3 on the same struct. DO NOT DO
// THIS. See pkg/kinds/server.go for the intended pattern.
package antipattern

import (
	"context"

	"google.golang.org/protobuf/proto"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/grpcplugin"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	pluginv3 "github.com/grafana/grafana-plugin-sdk-go/genproto/grafana/plugin/v3"
)

type MixedApp struct {
	backend.CallResourceHandler
	grpcplugin.UnimplementedV3Server

	// v2 instance management creates one MixedApp per (plugin_id, stack_id).
	settings *backend.AppInstanceSettings
}

func NewMixedApp(_ context.Context, s backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	return &MixedApp{settings: &s}, nil
}

// CheckHealth (v2): a.settings matches the calling stack.
func (a *MixedApp) CheckHealth(_ context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	_ = a.settings
	return &backend.CheckHealthResult{Status: backend.HealthStatusOk}, nil
}

// ValidateAdmission (v3) on the same struct.
//
// silent misuse: v3 does not use v2 instance management. a.settings holds
// whichever stack constructed this instance, not the stack calling here.
// Silently wrong for every other stack.
func (a *MixedApp) ValidateAdmission(
	_ context.Context,
	req *pluginv3.ValidateAdmissionRequest,
) (*pluginv3.ValidateAdmissionResponse, error) {
	_ = a.settings

	return pluginv3.ValidateAdmissionResponse_builder{
		Allowed: proto.Bool(true),
	}.Build(), nil
}
