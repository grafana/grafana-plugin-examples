package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/storedobjects"

	"github.com/myorg/backend/pkg/models"
)

// fakeWatchlistClient implements watchlistClient in memory. Like the real
// server, it persists written statuses so a subsequent List observes them,
// which is what lets tests exercise the evaluator's drift detection.
type fakeWatchlistClient struct {
	mu      sync.Mutex
	objects []storedobjects.Object
	listErr error
	// listed receives one signal per List call so tests can synchronize with
	// the evaluator loop instead of sleeping. Buffered by the tests.
	listed chan struct{}
	// updates records the object names passed to UpdateStatus, in order.
	updates []string
}

func (f *fakeWatchlistClient) List(_ context.Context, namespace, plural string) (*storedobjects.List, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.listed != nil {
		f.listed <- struct{}{}
	}
	if f.listErr != nil {
		return nil, f.listErr
	}
	if namespace != "default" || plural != watchlistPlural {
		return nil, errors.New("unexpected namespace or plural")
	}
	items := make([]storedobjects.Object, len(f.objects))
	copy(items, f.objects)
	return &storedobjects.List{Items: items}, nil
}

func (f *fakeWatchlistClient) UpdateStatus(_ context.Context, namespace, plural, name string, status any) (*storedobjects.Object, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if namespace != "default" || plural != watchlistPlural {
		return nil, errors.New("unexpected namespace or plural")
	}
	raw, err := json.Marshal(status)
	if err != nil {
		return nil, err
	}
	f.updates = append(f.updates, name)
	for i := range f.objects {
		if f.objects[i].Metadata.Name == name {
			f.objects[i].Status = raw
		}
	}
	return &storedobjects.Object{}, nil
}

func (f *fakeWatchlistClient) updateNames() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]string(nil), f.updates...)
}

func (f *fakeWatchlistClient) statusOf(t *testing.T, name string) models.WatchlistStatus {
	t.Helper()
	f.mu.Lock()
	defer f.mu.Unlock()
	for i := range f.objects {
		if f.objects[i].Metadata.Name == name {
			var status models.WatchlistStatus
			if err := json.Unmarshal(f.objects[i].Status, &status); err != nil {
				t.Fatalf("decode status of %q: %s", name, err)
			}
			return status
		}
	}
	t.Fatalf("object %q not found", name)
	return models.WatchlistStatus{}
}

func watchlistObject(t *testing.T, name string, spec models.WatchlistSpec, status *models.WatchlistStatus) storedobjects.Object {
	t.Helper()
	specRaw, err := json.Marshal(spec)
	if err != nil {
		t.Fatalf("marshal spec: %s", err)
	}
	obj := storedobjects.Object{
		Metadata: storedobjects.Metadata{Name: name, Namespace: "default"},
		Spec:     specRaw,
	}
	if status != nil {
		statusRaw, err := json.Marshal(status)
		if err != nil {
			t.Fatalf("marshal status: %s", err)
		}
		obj.Status = statusRaw
	}
	return obj
}

func testEvaluator(client watchlistClient, ticks <-chan time.Time) *watchlistEvaluator {
	e := newWatchlistEvaluator(client, "default", log.NewNullLogger())
	e.ticks = ticks
	return e
}

// waitSignal receives from ch or fails the test after a generous timeout, so
// a broken loop shows up as a failure instead of a hang.
func waitSignal[T any](t *testing.T, ch <-chan T, what string) {
	t.Helper()
	select {
	case <-ch:
	case <-time.After(5 * time.Second):
		t.Fatalf("timed out waiting for %s", what)
	}
}

func TestEvaluatorUpdatesOnlyDriftedItems(t *testing.T) {
	upToDate := models.WatchlistStatus{State: "evaluated", Message: "1 pattern(s) watched"}
	client := &fakeWatchlistClient{
		objects: []storedobjects.Object{
			// No status yet: needs a write.
			watchlistObject(t, "fresh", models.WatchlistSpec{Title: "a", Patterns: []string{"x", "y"}}, nil),
			// Stale status: needs a write.
			watchlistObject(t, "stale", models.WatchlistSpec{Title: "b", Patterns: []string{"x", "y", "z"}},
				&models.WatchlistStatus{State: "evaluated", Message: "1 pattern(s) watched"}),
			// Already matches what the evaluator would compute: no write.
			watchlistObject(t, "settled", models.WatchlistSpec{Title: "c", Patterns: []string{"x"}}, &upToDate),
		},
	}
	e := testEvaluator(client, nil)

	e.evaluate(context.Background())

	got := client.updateNames()
	want := []string{"fresh", "stale"}
	if len(got) != len(want) || got[0] != want[0] || got[1] != want[1] {
		t.Fatalf("first pass updates = %v, want %v", got, want)
	}
	if s := client.statusOf(t, "fresh"); s.State != "evaluated" || s.Message != "2 pattern(s) watched" {
		t.Fatalf("fresh status = %+v", s)
	}
	if s := client.statusOf(t, "stale"); s.State != "evaluated" || s.Message != "3 pattern(s) watched" {
		t.Fatalf("stale status = %+v", s)
	}

	// Second pass over the same (now converged) data must not write again.
	e.evaluate(context.Background())
	if got := client.updateNames(); len(got) != len(want) {
		t.Fatalf("second pass added updates: %v", got)
	}
}

func TestEvaluatorSurvivesListErrors(t *testing.T) {
	client := &fakeWatchlistClient{
		listErr: errors.New("boom"),
		listed:  make(chan struct{}, 16),
	}
	ticks := make(chan time.Time)
	e := testEvaluator(client, ticks)

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		e.run(ctx)
		close(done)
	}()

	waitSignal(t, client.listed, "initial evaluation")
	for i := 0; i < 2; i++ {
		ticks <- time.Time{}
		waitSignal(t, client.listed, "post-error tick evaluation")
	}

	cancel()
	waitSignal(t, done, "run to stop")

	if got := client.updateNames(); len(got) != 0 {
		t.Fatalf("unexpected updates: %v", got)
	}
}

func TestEvaluatorStopsOnContextCancel(t *testing.T) {
	client := &fakeWatchlistClient{
		objects: []storedobjects.Object{
			watchlistObject(t, "one", models.WatchlistSpec{Title: "a", Patterns: []string{"x"}}, nil),
		},
		listed: make(chan struct{}, 16),
	}
	e := testEvaluator(client, make(chan time.Time))

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		e.run(ctx)
		close(done)
	}()

	waitSignal(t, client.listed, "initial evaluation")
	cancel()
	waitSignal(t, done, "run to stop")
}
