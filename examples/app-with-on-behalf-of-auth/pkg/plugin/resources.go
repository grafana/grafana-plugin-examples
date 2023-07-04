package plugin

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/go-jose/go-jose/v3/jwt"
)

// parseToken parses the given JWT token and returns the headers and claims.
func (a *App) parseToken(token string) (map[string]interface{}, error) {
	res := map[string]interface{}{}
	parsedJWT, err := jwt.ParseSigned(token)
	if err != nil {
		return nil, err
	}
	claims := map[string]interface{}{}
	err = parsedJWT.UnsafeClaimsWithoutVerification(&claims)
	if err != nil {
		return nil, err
	}
	res["headers"] = parsedJWT.Headers
	res["claims"] = claims
	return res, nil
}

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

	proxyReq, err := http.NewRequest(proxyMethod, a.grafanaAppURL+req.URL.Path, bodyReader)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := req.FormValue("userID")
	var token string
	if userID == "" {
		token, err = a.tokenRetriever.Self(req.Context())
	} else {
		token, err = a.tokenRetriever.OnBehalfOfUser(req.Context(), userID)
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	proxyReq.Header.Set("Authorization", "Bearer "+token)

	// The PoC implementation of the single-tenant external service auth only supports the default
	// organization (orgId = 1), so for now it's okay to be harcoded to 1.
	proxyReq.Header.Set("X-Grafana-Org-Id", "1")

	if proxyMethod == "POST" {
		proxyReq.Header.Set("Content-Type", "application/json")
	}

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

	parsed, err := a.parseToken(token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"token":   parsed,
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
