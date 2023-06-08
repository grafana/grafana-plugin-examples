package plugin

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/google/uuid"
	"gopkg.in/square/go-jose.v2/jwt"
)

var (
	header = map[string]string{
		"alg": "RS256",
		"typ": "JWT",
		"kid": "1",
	}
)

func getPayload(userID, clientID, host string) map[string]interface{} {
	iat := time.Now().Unix()
	exp := iat + 1800
	u := uuid.New()
	payload := map[string]interface{}{
		"iss": clientID,
		"sub": fmt.Sprintf("user:id:%s", userID),
		"aud": host + "/oauth2/token",
		"exp": exp,
		"iat": iat,
		"jti": u.String(),
	}
	return payload
}

type JWTbearer struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	Scope       string `json:"scope"`
	TokenType   string `json:"token_type"`
}

func (a *App) retrieveJWTBearerToken(userID string) string {
	headerB, err := json.Marshal(header)
	if err != nil {
		panic(err)
	}
	headerB64 := base64.RawURLEncoding.EncodeToString(headerB)
	payloadB, err := json.Marshal(getPayload(userID, a.authApp.ClientID, a.grafanaAppURL))
	if err != nil {
		panic(err)
	}
	payloadB64 := base64.RawURLEncoding.EncodeToString(payloadB)

	input := fmt.Sprintf("%s.%s", headerB64, payloadB64)

	signer, err := loadPrivateKey(a.authApp.Key.Private)
	if err != nil {
		panic(err)
	}

	signed, err := signer.SignSHA256([]byte(input))
	if err != nil {
		panic(fmt.Sprintf("Could not sign the request: %v", err))
	}
	sig := base64.RawURLEncoding.EncodeToString(signed)

	assertion := fmt.Sprintf("%s.%s", input, sig)

	requestParams := url.Values{}
	requestParams.Add("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer")
	requestParams.Add("assertion", assertion)
	requestParams.Add("client_id", a.authApp.ClientID)
	requestParams.Add("client_secret", a.authApp.ClientSecret)
	requestParams.Add("scope", "profile email entitlements")
	buff := bytes.NewBufferString(requestParams.Encode())

	return a.postTokenRequest(buff)
}

func (a *App) retrieveSelfToken() string {
	requestParams := url.Values{}
	requestParams.Add("grant_type", "client_credentials")
	requestParams.Add("client_id", a.authApp.ClientID)
	requestParams.Add("client_secret", a.authApp.ClientSecret)
	requestParams.Add("scope", "profile email entitlements")
	buff := bytes.NewBufferString(requestParams.Encode())

	return a.postTokenRequest(buff)
}

func (a *App) postTokenRequest(buff *bytes.Buffer) string {
	req, err := http.NewRequest("POST", a.grafanaAppURL+"/oauth2/token", buff)
	if err != nil {
		panic(err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	var bearer JWTbearer
	err = json.Unmarshal(body, &bearer)
	if err != nil {
		panic(err)
	}

	return bearer.AccessToken
}

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

	proxy, err := http.NewRequest(proxyMethod, a.grafanaAppURL+req.URL.Path, bodyReader)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var token string
	if req.FormValue("onBehalfRequest") == "true" {
		token = a.retrieveJWTBearerToken(req.FormValue("userID"))
		proxy.Header.Set("Authorization", token)
	} else {
		token = a.retrieveSelfToken()
		proxy.Header.Set("Authorization", token)
	}

	if proxyMethod == "POST" {
		proxy.Header.Set("Content-Type", "application/json")
	}

	res, err := a.httpClient.Do(proxy)
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
