package plugin

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// handleAPI handles requests to the /api endpoint.
func (a *App) handleAPI(w http.ResponseWriter, req *http.Request) {
	proxyMethod := req.FormValue("method")
	if proxyMethod == "" {
		proxyMethod = "GET"
	}
	proxyBody := req.FormValue("body")
	var bodyReader io.Reader
	if proxyBody != "" {
		bodyReader = bytes.NewReader([]byte(proxyBody))
	}

	cfg := backend.GrafanaConfigFromContext(req.Context())
	grafanaAppURL, err := cfg.AppURL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	reqURL, err := url.JoinPath(grafanaAppURL, req.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	proxyReq, err := http.NewRequest(proxyMethod, reqURL, bodyReader)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if proxyMethod == "POST" || proxyMethod == "PUT" {
		proxyReq.Header.Set("Content-Type", "application/json")
	}

	saToken, err := cfg.PluginAppClientSecret()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	proxyReq.Header.Set("Authorization", "Bearer "+saToken)

	res, err := a.httpClient.Do(proxyReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Add("Content-Type", "application/json")

	if res.StatusCode != http.StatusOK {
		http.Error(w, string(body), http.StatusBadRequest)
		return
	}

	var bodyRes interface{}
	err = json.Unmarshal(body, &bodyRes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"token":   saToken, // This is just for demo purpose, you normally don't expose your token
		"results": bodyRes,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// registerRoutes takes a *http.ServeMux and registers some HTTP handlers.
func (a *App) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/", a.handleAPI)
}
