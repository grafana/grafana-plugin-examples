package plugin

import (
	"context"
	"encoding/json"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHealthCheck(t *testing.T) {
	// tc is a test case for the health check test
	type tc struct {
		// name identifies the test case
		name string

		// h is an http.HandlerFunc that will be used for the mocked http server connected to the datasource
		h http.HandlerFunc

		// pre is an (optional) function executed before the health check that can modify the datasource object
		pre func(ds *Datasource)

		// post is an (optional) function executed after the heath check.
		// it should be used to run assertions on the result of the health check
		post func(t *testing.T, res *backend.CheckHealthResult)
	}

	// Re-usable HTTP handler funcs
	h500 := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	})
	h200 := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	for _, c := range []tc{
		// Error 500 from the remote server should return a healthcheck error
		{
			name: "500",
			h:    h500,
			post: func(t *testing.T, res *backend.CheckHealthResult) {
				assert.Contains(t, res.Message, "500", "response message should contain status code")
			},
		},

		// Wrong URL on the datasource config should return a healthcheck error
		{
			name: "wrong url",
			h:    h500,
			pre: func(ds *Datasource) {
				ds.settings.URL = "wrong"
			},
			post: func(t *testing.T, res *backend.CheckHealthResult) {
				assert.Equal(t, "request error", res.Message)
			},
		},

		// 200 OK from the remote server should return an OK healthcheck
		{
			name: "success",
			h:    h200,
			post: func(t *testing.T, res *backend.CheckHealthResult) {
				assert.Equal(t, backend.HealthStatusOk, res.Status, "status should be ok")
				assert.Equal(t, "Data source is working", res.Message, "message should be correct")
			},
		},
	} {
		t.Run(c.name, func(t *testing.T) {
			// Create mock server
			svc := httptest.NewServer(c.h)
			defer svc.Close()

			// Create its corresponding datasource
			ds := newMockDataSourceFromHttpTestServer(svc, "")

			// Optionally run the testcase's pre function
			if c.pre != nil {
				c.pre(&ds)
			}

			// Run healthcheck and do not expect a function err
			resp, err := ds.CheckHealth(context.Background(), nil)
			require.NoError(t, err, "CheckHealth must not return an error")
			require.NotNil(t, resp, "resp must not be nil")

			// Optionally run the testcase's post function (extra assertions)
			if c.post != nil {
				c.post(t, resp)
			}
		})
	}
}

func TestQueryData(t *testing.T) {
	ds, srv := newDefaultMockDataSource()
	defer srv.Close()

	// Execute http request against remote server to compare result with dataframe
	req, err := http.NewRequest(http.MethodGet, srv.URL+"/metrics", nil)
	require.NoError(t, err)
	mockResp, err := ds.httpClient.Do(req)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, mockResp.StatusCode, "mock response should be 200")
	var respData apiMetrics
	require.NoError(
		t,
		json.NewDecoder(mockResp.Body).Decode(&respData),
		"response json decode should succeed",
	)
	assert.NotEmpty(t, respData.DataPoints, "response should contain datapoints")

	// Execute request via QueryData method
	const refID = "A"
	resp, err := ds.QueryData(
		context.Background(),
		&backend.QueryDataRequest{
			Queries: []backend.DataQuery{
				{RefID: refID},
			},
		},
	)
	require.NoError(t, err, "QueryData must not return an error")
	require.NotNil(t, resp, "QueryData must return a response")
	require.Len(t, resp.Responses, 1, "QueryData must return one response")
	r, ok := resp.Responses[refID]
	require.True(t, ok, "Responses should contain a response with the correct reference")
	assert.Nil(t, r.Error, "QueryData response must not return an error")
	require.Len(t, r.Frames, 1, "response should have 1 frame")
	fields := make(map[string]*data.Field, 2)
	vecLen := -1
	for _, f := range r.Frames[0].Fields {
		// Make sure all fields have the same vector length
		if vecLen == -1 {
			vecLen = f.Len()
		}
		assert.Equalf(t, f.Len(), vecLen, "all fields should have the same length of %d, %q had %d", vecLen, f.Name, f.Len())

		// Map f.name -> f for easier access, duplicate check...
		_, ok := fields[f.Name]
		assert.Falsef(t, ok, "duplicate field found in frame %q", f.Name)
		fields[f.Name] = f
	}
	assert.Len(t, fields, 2, "should have correct number of fields")
	// Ensure the required fields are included
	for _, k := range []string{"time", "values"} {
		_, ok = fields[k]
		assert.Truef(t, ok, "shold have field %q", k)
	}
	// Make sure the number of data points matches the one from the remote server's http response
	assert.Equal(t, len(respData.DataPoints), vecLen, "returned vector should have correct length")
	for i := 0; i < len(respData.DataPoints); i++ {
		// Make sure the returned data points (value, times) are the same as the api
		assert.Equal(
			t,
			respData.DataPoints[i].Time.Truncate(time.Second*1),
			fields["time"].At(i).(time.Time).Truncate(time.Second*1),
		)
		assert.Equal(t, respData.DataPoints[i].Value, fields["values"].At(i))
	}
}

// newMockDataSourceFromHttpTestServer returns a new Datasource that connects to the
// specified testServer.
func newMockDataSourceFromHttpTestServer(testServer *httptest.Server, urlSuffix string) Datasource {
	return Datasource{
		httpClient: testServer.Client(),
		settings: backend.DataSourceInstanceSettings{
			URL: testServer.URL + urlSuffix,
		},
	}
}

// newDefaultMockDataSource creates a new httptest.Server which implements a handler
// that returns a valid JSON apiMetrics as its
// handler, and returns a Datasource that is linked to the /metrics handler of the httptest.Server.
// The function returns both the Datasource and the httptest.Server.
// The caller should `defer Close()` the returned httptest.Server.
func newDefaultMockDataSource() (Datasource, *httptest.Server) {
	mux := http.NewServeMux()
	mux.HandleFunc("/metrics", func(w http.ResponseWriter, req *http.Request) {
		const pointsN = 1024
		points := make([]apiDataPoint, pointsN)
		for i := 0; i < pointsN; i++ {
			ts := time.Now().Add(time.Second * time.Duration(-i)).UTC()
			points[i].Time = ts
			points[i].Value = float64(i)
		}
		w.Header().Add("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(apiMetrics{
			DataPoints: points,
		}); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
	})
	srv := httptest.NewServer(mux)
	return newMockDataSourceFromHttpTestServer(srv, "/metrics"), srv
}
