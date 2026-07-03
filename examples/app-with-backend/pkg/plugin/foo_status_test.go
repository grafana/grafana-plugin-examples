package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/storedobjects"

	"github.com/myorg/backend/pkg/models"
)

func TestUpdateFooStatusWritesOnlyWhenChanged(t *testing.T) {
	server := newStoredObjectServer(t)
	defer server.Close()

	foos := server.collection(t, "write-on-change")
	item := foo("one", []string{"alpha"}, models.FooStatus{State: "evaluated"})

	if err := updateFooStatus(context.Background(), foos, item); err != nil {
		t.Fatalf("update unchanged status: %s", err)
	}
	if got := server.patchNames(); len(got) != 0 {
		t.Fatalf("unchanged status wrote patches: %v", got)
	}

	item.Status = models.FooStatus{State: "old"}
	if err := updateFooStatus(context.Background(), foos, item); err != nil {
		t.Fatalf("update changed status: %s", err)
	}

	if got, want := server.patchNames(), []string{"one"}; !slices.Equal(got, want) {
		t.Fatalf("patched names = %v, want %v", got, want)
	}
	if got, want := server.patchStatuses()["one"], statusForItems(1); got != want {
		t.Fatalf("patched status = %+v, want %+v", got, want)
	}
}

func TestRunFooStatusUpdatesProcessesIncomingEvents(t *testing.T) {
	server := newStoredObjectServer(t)
	defer server.Close()

	namespace := "status-updates"
	foos := server.collection(t, namespace)
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		runFooStatusUpdates(ctx, foos, log.NewNullLogger())
		close(done)
	}()

	waitUntil(t, "Foo watch subscription", func() bool {
		return slices.Contains(storedobjects.DefaultKindSubscription().Kinds(), "Foo")
	})

	storedobjects.PublishEvent(namespace, "Foo", storedobjects.EventDeleted, []byte(`{
		"metadata": {"name": "deleted"},
		"spec": {"title": "Deleted", "items": ["alpha"]}
	}`))
	storedobjects.PublishEvent(namespace, "Foo", storedobjects.EventCreated, []byte(`{
		"metadata": {"name": "created"},
		"spec": {"title": "Created", "items": ["alpha", "beta"]}
	}`))

	waitSignal(t, server.patched, "event status patch")
	cancel()
	waitSignal(t, done, "status updates to stop")
	waitUntil(t, "Foo watch subscription cleanup", func() bool {
		return !slices.Contains(storedobjects.DefaultKindSubscription().Kinds(), "Foo")
	})

	if got, want := server.patchNames(), []string{"created"}; !slices.Equal(got, want) {
		t.Fatalf("patched names = %v, want %v", got, want)
	}
	if got, want := server.patchStatuses()["created"], statusForItems(2); got != want {
		t.Fatalf("event status = %+v, want %+v", got, want)
	}
}

type storedObjectServer struct {
	*httptest.Server

	mu       sync.Mutex
	patches  []string
	statuses map[string]models.FooStatus

	patched chan struct{}
}

func newStoredObjectServer(t *testing.T) *storedObjectServer {
	t.Helper()

	s := &storedObjectServer{
		statuses: map[string]models.FooStatus{},
		patched:  make(chan struct{}, 16),
	}
	s.Server = httptest.NewServer(http.HandlerFunc(s.handle))
	return s
}

func (s *storedObjectServer) collection(t *testing.T, namespace string) *fooCollection {
	t.Helper()

	client, err := storedobjects.NewClient(storedobjects.ClientOpts{
		AppURL:       s.URL,
		Token:        "test-token",
		Group:        "myorg-backend-app",
		OrgNamespace: namespace,
	})
	if err != nil {
		t.Fatalf("new stored-objects client: %s", err)
	}
	return storedobjects.NewCollection[models.FooSpec, models.FooStatus](client, "Foo")
}

func (s *storedObjectServer) patchNames() []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]string(nil), s.patches...)
}

func (s *storedObjectServer) patchStatuses() map[string]models.FooStatus {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make(map[string]models.FooStatus, len(s.statuses))
	for name, status := range s.statuses {
		out[name] = status
	}
	return out
}

func (s *storedObjectServer) handle(w http.ResponseWriter, r *http.Request) {
	if got, want := r.Header.Get("Authorization"), "Bearer test-token"; got != want {
		http.Error(w, "bad authorization", http.StatusUnauthorized)
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) != 6 && len(parts) != 8 {
		http.NotFound(w, r)
		return
	}
	collection := parts[5]
	if collection != "foos" {
		http.NotFound(w, r)
		return
	}

	switch {
	case r.Method == http.MethodPatch && len(parts) == 8 && parts[7] == "status":
		s.handleStatusPatch(w, parts[6], r)
	default:
		http.NotFound(w, r)
	}
}

func (s *storedObjectServer) handleStatusPatch(w http.ResponseWriter, name string, r *http.Request) {
	var body struct {
		Status models.FooStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	s.patches = append(s.patches, name)
	s.statuses[name] = body.Status
	s.mu.Unlock()

	s.patched <- struct{}{}
	writeJSON(w, envelopeFor(foo(name, nil, body.Status)))
}

type objectEnvelope struct {
	Metadata struct {
		Name string `json:"name"`
	} `json:"metadata"`
	Spec   models.FooSpec   `json:"spec,omitempty"`
	Status models.FooStatus `json:"status,omitempty"`
}

func envelopeFor(item fooItem) objectEnvelope {
	env := objectEnvelope{
		Spec:   item.Spec,
		Status: item.Status,
	}
	env.Metadata.Name = item.Name
	return env
}

func foo(name string, items []string, status models.FooStatus) fooItem {
	return fooItem{
		Name: name,
		Spec: models.FooSpec{
			Title: name,
			Items: items,
		},
		Status: status,
	}
}

func statusForItems(n int) models.FooStatus {
	return models.FooStatus{
		State:   "evaluated",
		Message: fmt.Sprintf("%d item(s) configured", n),
	}
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

func waitSignal[T any](t *testing.T, ch <-chan T, what string) {
	t.Helper()

	select {
	case <-ch:
	case <-time.After(5 * time.Second):
		t.Fatalf("timed out waiting for %s", what)
	}
}

func waitUntil(t *testing.T, what string, ok func() bool) {
	t.Helper()

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		if ok() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for %s", what)
}
