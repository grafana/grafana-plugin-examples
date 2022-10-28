package service

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"math"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestService(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	resp := httptest.NewRecorder()
	err := getMetrics(resp, req)

	// Check response headers
	require.Nil(t, err, "getMetrics should not return an error")
	assert.Equal(t, http.StatusOK, resp.Code, "response should be correct")
	assert.Equal(t, "application/json", resp.Header().Get("Content-Type"), "content-type should be correct")

	// Check response body
	var out metrics
	require.Nil(t, json.NewDecoder(resp.Body).Decode(&out), "json decode should not return an error")
	assert.NotEmpty(t, out.DataPoints, "out.DataPoints should not be empty")
	const expDataPoints = 1024
	assert.Lenf(t, out.DataPoints, expDataPoints, "response should have %d data points", expDataPoints)

	// Check each data point
	for i, p := range out.DataPoints {
		ts := time.Now().Add(time.Second * -time.Duration(i)).Truncate(time.Second * 1).UTC()
		assert.Equal(t, ts, p.Time.Truncate(time.Second*1))
		assert.Equal(t, math.Sin(float64(ts.Unix())/10), p.Value)
	}
}
