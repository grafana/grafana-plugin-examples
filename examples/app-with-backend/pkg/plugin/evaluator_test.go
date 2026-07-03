package plugin

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/storedobjects"

	"github.com/myorg/backend/pkg/models"
)

// fakeWatchlistCollection implements watchlistCollection in memory. Like the
// real server, it persists written statuses so a subsequent List observes
// them, which is what lets tests exercise the evaluator's drift detection.
// Its Watch returns a test-owned channel, so tests feed change events
// directly instead of going through the SDK's event stream.
type fakeWatchlistCollection struct {
	mu      sync.Mutex
	items   []watchlistItem
	listErr error
	// listed receives one signal per List call so tests can synchronize with
	// the evaluator loop instead of sleeping. Buffered by the tests.
	listed chan struct{}
	// wrote receives one signal per WriteStatus call, same purpose as listed.
	wrote chan struct{}
	// events is what Watch hands to the evaluator.
	events chan watchlistEvent
	// writes records the item names passed to WriteStatus, in order.
	writes []string
}

func (f *fakeWatchlistCollection) List(_ context.Context) ([]watchlistItem, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.listed != nil {
		f.listed <- struct{}{}
	}
	if f.listErr != nil {
		return nil, f.listErr
	}
	return append([]watchlistItem(nil), f.items...), nil
}

func (f *fakeWatchlistCollection) WriteStatus(_ context.Context, name string, status models.WatchlistStatus) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.writes = append(f.writes, name)
	for i := range f.items {
		if f.items[i].Name == name {
			f.items[i].Status = status
		}
	}
	if f.wrote != nil {
		f.wrote <- struct{}{}
	}
	return nil
}

func (f *fakeWatchlistCollection) Watch(context.Context) (<-chan watchlistEvent, error) {
	return f.events, nil
}

func (f *fakeWatchlistCollection) writeNames() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]string(nil), f.writes...)
}

func (f *fakeWatchlistCollection) statusOf(t *testing.T, name string) models.WatchlistStatus {
	t.Helper()
	f.mu.Lock()
	defer f.mu.Unlock()
	for i := range f.items {
		if f.items[i].Name == name {
			return f.items[i].Status
		}
	}
	t.Fatalf("item %q not found", name)
	return models.WatchlistStatus{}
}

func watchlist(name string, patterns []string, status models.WatchlistStatus) watchlistItem {
	return watchlistItem{
		Name:   name,
		Spec:   models.WatchlistSpec{Title: name, Patterns: patterns},
		Status: status,
	}
}

// evaluatedStatus is the status the evaluator computes for a spec with n
// patterns.
func evaluatedStatus(n int) models.WatchlistStatus {
	return models.WatchlistStatus{State: "evaluated", Message: fmt.Sprintf("%d pattern(s) watched", n)}
}

func testEvaluator(collection watchlistCollection, resyncTicks <-chan time.Time) *watchlistEvaluator {
	e := newWatchlistEvaluator(collection, log.NewNullLogger())
	e.resyncTicks = resyncTicks
	return e
}

// startEvaluator runs the evaluator loop in a goroutine and returns a cancel
// func plus a channel that closes when the loop exits.
func startEvaluator(e *watchlistEvaluator) (context.CancelFunc, <-chan struct{}) {
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		e.run(ctx)
		close(done)
	}()
	return cancel, done
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

func TestEvaluatorInitialPassWritesOnlyDriftedItems(t *testing.T) {
	f := &fakeWatchlistCollection{
		items: []watchlistItem{
			// No status yet: needs a write.
			watchlist("fresh", []string{"x", "y"}, models.WatchlistStatus{}),
			// Stale status: needs a write.
			watchlist("stale", []string{"x", "y", "z"}, evaluatedStatus(1)),
			// Already matches what the evaluator would compute: no write.
			watchlist("settled", []string{"x"}, evaluatedStatus(1)),
		},
	}
	e := testEvaluator(f, nil)

	e.evaluateAll(context.Background())

	got := f.writeNames()
	want := []string{"fresh", "stale"}
	if len(got) != len(want) || got[0] != want[0] || got[1] != want[1] {
		t.Fatalf("first pass writes = %v, want %v", got, want)
	}
	if s := f.statusOf(t, "fresh"); s != evaluatedStatus(2) {
		t.Fatalf("fresh status = %+v", s)
	}
	if s := f.statusOf(t, "stale"); s != evaluatedStatus(3) {
		t.Fatalf("stale status = %+v", s)
	}

	// Second pass over the same (now converged) data must not write again.
	e.evaluateAll(context.Background())
	if got := f.writeNames(); len(got) != len(want) {
		t.Fatalf("second pass added writes: %v", got)
	}
}

func TestEvaluatorEventsDriveSingleItemWrites(t *testing.T) {
	f := &fakeWatchlistCollection{
		// Already converged, so the initial pass writes nothing and every
		// write observed below is attributable to an event.
		items:  []watchlistItem{watchlist("settled", []string{"x"}, evaluatedStatus(1))},
		listed: make(chan struct{}, 16),
		wrote:  make(chan struct{}, 16),
		events: make(chan watchlistEvent),
	}
	e := testEvaluator(f, make(chan time.Time)) // re-list ticks never fire
	cancel, done := startEvaluator(e)
	defer cancel()

	waitSignal(t, f.listed, "initial list pass")

	// A created item with no status yet drifts: expect exactly one write.
	f.events <- watchlistEvent{Type: storedobjects.EventCreated, Item: watchlist("fresh", []string{"x", "y"}, models.WatchlistStatus{})}
	waitSignal(t, f.wrote, "write after created event")

	// An updated item whose status already matches must not write. Events are
	// handled serially, so following it with an event that must write proves
	// the no-write: had "settled" been written, it would appear first.
	f.events <- watchlistEvent{Type: storedobjects.EventUpdated, Item: watchlist("settled", []string{"x"}, evaluatedStatus(1))}
	f.events <- watchlistEvent{Type: storedobjects.EventUpdated, Item: watchlist("stale", []string{"x", "y", "z"}, evaluatedStatus(1))}
	waitSignal(t, f.wrote, "write after drifted update event")

	cancel()
	waitSignal(t, done, "run to stop")

	got := f.writeNames()
	want := []string{"fresh", "stale"}
	if len(got) != len(want) || got[0] != want[0] || got[1] != want[1] {
		t.Fatalf("event-driven writes = %v, want %v", got, want)
	}
	// Events must evaluate single items, never trigger a re-list: the only
	// List call is the initial pass already consumed above.
	if extra := len(f.listed); extra != 0 {
		t.Fatalf("events triggered %d extra list passes", extra)
	}
}

func TestEvaluatorIgnoresDeletedEvents(t *testing.T) {
	f := &fakeWatchlistCollection{
		listed: make(chan struct{}, 16),
		wrote:  make(chan struct{}, 16),
		events: make(chan watchlistEvent),
	}
	e := testEvaluator(f, make(chan time.Time))
	cancel, done := startEvaluator(e)
	defer cancel()

	waitSignal(t, f.listed, "initial list pass")

	// The deleted item would drift if evaluated, so any write for it is a
	// bug. The created event after it proves the delete was processed (and
	// skipped) since events are handled in order.
	f.events <- watchlistEvent{Type: storedobjects.EventDeleted, Item: watchlist("gone", []string{"x", "y"}, models.WatchlistStatus{})}
	f.events <- watchlistEvent{Type: storedobjects.EventCreated, Item: watchlist("after", []string{"x"}, models.WatchlistStatus{})}
	waitSignal(t, f.wrote, "write after created event")

	cancel()
	waitSignal(t, done, "run to stop")

	got := f.writeNames()
	if len(got) != 1 || got[0] != "after" {
		t.Fatalf("writes = %v, want [after]", got)
	}
}

func TestEvaluatorSurvivesListErrors(t *testing.T) {
	f := &fakeWatchlistCollection{
		listErr: errors.New("boom"),
		listed:  make(chan struct{}, 16),
		events:  make(chan watchlistEvent),
	}
	ticks := make(chan time.Time)
	e := testEvaluator(f, ticks)
	cancel, done := startEvaluator(e)
	defer cancel()

	waitSignal(t, f.listed, "initial list pass")
	// The loop must keep taking re-list ticks after failed passes.
	for i := 0; i < 2; i++ {
		ticks <- time.Time{}
		waitSignal(t, f.listed, "post-error re-list pass")
	}

	cancel()
	waitSignal(t, done, "run to stop")

	if got := f.writeNames(); len(got) != 0 {
		t.Fatalf("unexpected writes: %v", got)
	}
}

func TestEvaluatorStopsOnContextCancel(t *testing.T) {
	f := &fakeWatchlistCollection{
		items:  []watchlistItem{watchlist("one", []string{"x"}, models.WatchlistStatus{})},
		listed: make(chan struct{}, 16),
		events: make(chan watchlistEvent),
	}
	e := testEvaluator(f, make(chan time.Time))
	cancel, done := startEvaluator(e)

	waitSignal(t, f.listed, "initial list pass")
	cancel()
	waitSignal(t, done, "run to stop")
}
