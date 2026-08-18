// Package kinds holds the plugin's v3 handlers, kept separate from the v2
// pkg/plugin package so the two authoring models do not intermix.
//
// coexistence: both models live in the same binary, never in the same file.
package kinds

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend/grpcplugin"
)

type Server struct {
	grpcplugin.UnimplementedV3Server
}

func NewServer() *Server {
	return &Server{}
}
