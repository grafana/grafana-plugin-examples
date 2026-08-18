package kinds

import (
	"encoding/json"
	"net/http"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	pluginv3 "github.com/grafana/grafana-plugin-sdk-go/genproto/grafana/plugin/v3"
)

// CallRoute is the single entry point for every route this plugin serves.
//
// request shape: no explicit signal. Inferred from field emptiness below.
func (s *Server) CallRoute(
	req *pluginv3.CallRouteRequest,
	stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse],
) error {
	// silent misuse: compiles and returns zero PluginContext in a v3 code
	// path. No error, no warning.
	pCtx := httpadapter.PluginConfigFromContext(stream.Context())
	_ = pCtx.OrgID               // always 0 in v3
	_ = pCtx.AppInstanceSettings // always nil in v3

	parent := req.GetParent()
	switch {
	case parent.GetResource() != "" && parent.GetName() != "" && parent.GetNamespace() != "":
		return s.handleNamespacedSubresource(req, stream)
	case parent.GetResource() != "" && parent.GetName() != "" && parent.GetNamespace() == "":
		return s.handleClusterSubresource(req, stream)
	case parent.GetResource() == "" && parent.GetNamespace() != "":
		return s.handleNamespacedRoute(req, stream)
	default:
		return s.handleClusterRoute(req, stream)
	}
}

func (s *Server) handleNamespacedSubresource(
	req *pluginv3.CallRouteRequest,
	stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse],
) error {
	if req.GetParent().GetResource() != "watchlists" {
		return sendJSON(stream, http.StatusNotFound, `{"error":"not found"}`)
	}

	method := req.GetMethod()
	path := req.GetPath()

	switch {
	case method == http.MethodPost && strings.HasSuffix(path, "/import"):
		return s.importWatchlist(req, stream)
	case method == http.MethodGet && strings.HasSuffix(path, "/status"):
		return s.getWatchlistStatus(req, stream)
	default:
		return sendJSON(stream, http.StatusNotFound, `{"error":"not found"}`)
	}
}

func (s *Server) handleClusterSubresource(_ *pluginv3.CallRouteRequest, stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse]) error {
	return sendJSON(stream, http.StatusNotFound, `{"error":"not found"}`)
}

func (s *Server) handleNamespacedRoute(_ *pluginv3.CallRouteRequest, stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse]) error {
	return sendJSON(stream, http.StatusNotFound, `{"error":"not found"}`)
}

func (s *Server) handleClusterRoute(_ *pluginv3.CallRouteRequest, stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse]) error {
	return sendJSON(stream, http.StatusNotFound, `{"error":"not found"}`)
}

func (s *Server) importWatchlist(
	req *pluginv3.CallRouteRequest,
	stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse],
) error {
	var body struct {
		Source string `json:"source"`
	}
	if err := json.Unmarshal(req.GetBody(), &body); err != nil {
		return sendJSON(stream, http.StatusBadRequest, `{"error":"invalid body"}`)
	}

	// plugin settings: no way to reach the plugin's backend URL from here.

	return sendJSON(stream, http.StatusOK, `{"imported":42}`)
}

func (s *Server) getWatchlistStatus(_ *pluginv3.CallRouteRequest, stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse]) error {
	return sendJSON(stream, http.StatusOK, `{"status":"ready"}`)
}

func sendJSON(stream grpc.ServerStreamingServer[pluginv3.CallRouteResponse], code int, body string) error {
	return stream.Send(pluginv3.CallRouteResponse_builder{
		Code: proto.Int32(int32(code)),
		Headers: map[string]*pluginv3.StringList{
			"Content-Type": {Values: []string{"application/json"}},
		},
		Body: []byte(body),
	}.Build())
}
