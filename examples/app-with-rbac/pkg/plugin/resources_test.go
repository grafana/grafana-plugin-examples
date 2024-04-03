package plugin

import (
	"bytes"
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/mock"

	"github.com/grafana/authlib/authz"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// mockCallResourceResponseSender implements backend.CallResourceResponseSender
// for use in tests.
type mockCallResourceResponseSender struct {
	response *backend.CallResourceResponse
}

// Send sets the received *backend.CallResourceResponse to s.response
func (s *mockCallResourceResponseSender) Send(response *backend.CallResourceResponse) error {
	s.response = response
	return nil
}

type mockAuthZClient struct {
	mock.Mock
}

// Compile implements authz.EnforcementClient.
func (m *mockAuthZClient) Compile(ctx context.Context, idToken string, action string, kinds ...string) (authz.Checker, error) {
	args := m.Called(ctx, idToken, action, kinds)
	return args.Get(0).(authz.Checker), args.Error(1)
}

// HasAccess implements authz.EnforcementClient.
func (m *mockAuthZClient) HasAccess(ctx context.Context, idToken string, action string, resources ...authz.Resource) (bool, error) {
	args := m.Called(ctx, idToken, action, resources)
	return args.Get(0).(bool), args.Error(1)
}

// LookupResources implements authz.EnforcementClient.
func (m *mockAuthZClient) LookupResources(ctx context.Context, idToken string, action string) ([]authz.Resource, error) {
	args := m.Called(ctx, idToken, action)
	return args.Get(0).([]authz.Resource), args.Error(1)
}

// TestCallResource tests CallResource calls, using backend.CallResourceRequest and backend.CallResourceResponse.
// This ensures the httpadapter for CallResource works correctly.
func TestCallResource(t *testing.T) {
	// Initialize app
	inst, err := NewApp(context.Background(), backend.AppInstanceSettings{})
	if err != nil {
		t.Fatalf("new app: %s", err)
	}
	if inst == nil {
		t.Fatal("inst must not be nil")
	}
	app, ok := inst.(*App)
	if !ok {
		t.Fatal("inst must be of type *App")
	}

	app.saToken = "FakeSecret"

	// Set up and run test cases
	for _, tc := range []struct {
		name string

		method string
		path   string
		body   []byte

		init func(*testing.T, *mockAuthZClient)

		expStatus int
		expBody   []byte
	}{
		{
			name:   "get papers",
			method: http.MethodGet,
			path:   "papers",
			init: func(t *testing.T, m *mockAuthZClient) {
				m.On("HasAccess", mock.Anything, "FakeId", "grafana-appwithrbac-app.papers:read", mock.Anything).Return(true, nil)
			},
			expStatus: http.StatusOK,
		},
		{
			name:   "get patents",
			method: http.MethodGet,
			path:   "patents",
			init: func(t *testing.T, m *mockAuthZClient) {
				m.On("HasAccess", mock.Anything, "FakeId", "grafana-appwithrbac-app.patents:read", mock.Anything).Return(true, nil)
			},
			expStatus: http.StatusOK,
		},
		{
			name:      "get unknown",
			method:    http.MethodGet,
			path:      "unknown",
			expStatus: http.StatusNotFound,
		},
		{
			name:      "post papers",
			method:    http.MethodPost,
			path:      "papers",
			body:      []byte(`{"message":"ok"}`),
			expStatus: http.StatusMethodNotAllowed,
		},
		{
			name:   "get papers forbidden",
			method: http.MethodGet,
			path:   "papers",
			init: func(t *testing.T, m *mockAuthZClient) {
				m.On("HasAccess", mock.Anything, "FakeId", "grafana-appwithrbac-app.papers:read", mock.Anything).Return(false, nil)
			},
			expStatus: http.StatusForbidden,
		},
		{
			name:   "get patents forbidden",
			method: http.MethodGet,
			path:   "patents",
			init: func(t *testing.T, m *mockAuthZClient) {
				m.On("HasAccess", mock.Anything, "FakeId", "grafana-appwithrbac-app.patents:read", mock.Anything).Return(false, nil)
			},
			expStatus: http.StatusForbidden,
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			// Request by calling CallResource. This tests the httpadapter.
			var r mockCallResourceResponseSender

			// Initialize mockAuthZClient
			mock := &mockAuthZClient{}
			if tc.init != nil {
				tc.init(t, mock)
			}
			app.authzClient = mock

			// Initialize context with Grafana config
			ctx := backend.WithGrafanaConfig(context.Background(), backend.NewGrafanaCfg(map[string]string{
				backend.AppURL:          "http://localhost",
				backend.AppClientSecret: "FakeSecret",
			}))

			err = app.CallResource(ctx, &backend.CallResourceRequest{
				Method: tc.method,
				Path:   tc.path,
				Body:   tc.body,
				Headers: map[string][]string{
					"X-Grafana-Id": {"FakeId"},
				},
			}, &r)
			if err != nil {
				t.Fatalf("CallResource error: %s", err)
			}
			if r.response == nil {
				t.Fatal("no response received from CallResource")
			}
			if tc.expStatus > 0 && tc.expStatus != r.response.Status {
				t.Errorf("response status should be %d, got %d", tc.expStatus, r.response.Status)
			}
			if len(tc.expBody) > 0 {
				if tb := bytes.TrimSpace(r.response.Body); !bytes.Equal(tb, tc.expBody) {
					t.Errorf("response body should be %s, got %s", tc.expBody, tb)
				}
			}
		})
	}
}
