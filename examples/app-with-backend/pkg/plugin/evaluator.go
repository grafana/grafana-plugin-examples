package plugin

import (
	"context"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/storedobjects"

	"github.com/myorg/backend/pkg/models"
)

// defaultResyncInterval is how often the evaluator re-lists all watchlists
// when no interval is injected (tests use a driven channel instead). It can be
// slow because change events do the timely work; the re-list is only a safety
// net (see run).
const defaultResyncInterval = 5 * time.Minute

// watchlistItem and watchlistEvent pin the generic stored-objects types to
// this plugin's Watchlist spec and status, so the rest of the file reads in
// domain terms.
type (
	watchlistItem  = storedobjects.Item[models.WatchlistSpec, models.WatchlistStatus]
	watchlistEvent = storedobjects.Event[models.WatchlistSpec, models.WatchlistStatus]
)

// watchlistCollection is the narrow slice of *storedobjects.Collection the
// evaluator needs. Depending on an interface rather than the concrete
// collection lets tests inject a fake and feed it events without any HTTP or
// event-stream machinery.
type watchlistCollection interface {
	List(ctx context.Context) ([]watchlistItem, error)
	WriteStatus(ctx context.Context, name string, status models.WatchlistStatus) error
	Watch(ctx context.Context) (<-chan watchlistEvent, error)
}

var _ watchlistCollection = (*storedobjects.Collection[models.WatchlistSpec, models.WatchlistStatus])(nil)

// watchlistEvaluator demonstrates a background worker over stored objects in
// plugin idiom: a goroutine that keeps each Watchlist's status in step with
// its spec. It is event-driven — Grafana pushes a change event whenever a
// watchlist is written — with a full list pass at startup and a slow periodic
// re-list as backstops. Note the limits: each Grafana replica runs its own
// plugin process and therefore its own evaluator, so concurrent (duplicate)
// status writes are possible. The loop tolerates that because every write is
// idempotent: status is computed purely from spec, and unchanged status is
// never written at all.
type watchlistEvaluator struct {
	collection     watchlistCollection
	resyncInterval time.Duration
	logger         log.Logger

	// resyncTicks, when non-nil, replaces the interval ticker so tests can
	// drive re-list passes deterministically instead of sleeping.
	resyncTicks <-chan time.Time
}

// newWatchlistEvaluator creates an evaluator using the default re-list
// interval.
func newWatchlistEvaluator(collection watchlistCollection, logger log.Logger) *watchlistEvaluator {
	return &watchlistEvaluator{
		collection:     collection,
		resyncInterval: defaultResyncInterval,
		logger:         logger,
	}
}

// run blocks until ctx is canceled. It starts watching for change events,
// does one full list pass, then reacts to events as they arrive. Errors are
// logged and swallowed: a failed pass or item must not kill the loop, because
// a later event or re-list gets a fresh chance to converge.
func (e *watchlistEvaluator) run(ctx context.Context) {
	// Subscribe before the catch-up list so a change that lands while the
	// list is in flight still arrives as an event instead of falling into the
	// gap between the two.
	events, err := e.collection.Watch(ctx)
	if err != nil {
		e.logger.Error("watchlist evaluation: watch failed, falling back to periodic re-list only", "error", err)
		events = nil // a nil channel never delivers, so only re-lists run
	}

	// Catch-up pass: events only report changes made while this process is
	// running, so anything created or edited while the plugin was down (or
	// before this instance started) is picked up here.
	e.evaluateAll(ctx)

	ticks := e.resyncTicks
	if ticks == nil {
		ticker := time.NewTicker(e.resyncInterval)
		defer ticker.Stop()
		ticks = ticker.C
	}

	for {
		select {
		case <-ctx.Done():
			return
		case ev, ok := <-events:
			if !ok {
				// The event stream closes when ctx is canceled; park on a nil
				// channel and let ctx.Done() (or a re-list tick) take over.
				events = nil
				continue
			}
			e.handleEvent(ctx, ev)
		case <-ticks:
			// Slow periodic re-list as a safety net: pushed events can be
			// missed (plugin restarts, a consumer falling behind), and a full
			// pass converges anything an event skipped.
			e.evaluateAll(ctx)
		}
	}
}

// handleEvent reacts to one pushed change. Creates and updates re-evaluate
// just the item that changed — no full re-list. Deletes are ignored: the
// object is gone, so there is no status left to write.
func (e *watchlistEvaluator) handleEvent(ctx context.Context, ev watchlistEvent) {
	if ev.Type == storedobjects.EventDeleted {
		return
	}
	if err := e.evaluateItem(ctx, ev.Item); err != nil {
		e.logger.Error("watchlist evaluation: item failed", "name", ev.Item.Name, "error", err)
	}
}

// evaluateAll performs a full pass: list every watchlist and converge each
// one's status. Per-item failures are logged and skipped so one bad object
// cannot starve the rest.
func (e *watchlistEvaluator) evaluateAll(ctx context.Context) {
	items, err := e.collection.List(ctx)
	if err != nil {
		e.logger.Error("watchlist evaluation: list failed", "error", err)
		return
	}

	for _, item := range items {
		if err := e.evaluateItem(ctx, item); err != nil {
			e.logger.Error("watchlist evaluation: item failed", "name", item.Name, "error", err)
		}
	}
}

// evaluateItem computes the desired status from the item's spec and writes it
// only when it differs from what is already stored. Writing only on drift
// keeps the loop idempotent and cheap — a converged item costs one comparison,
// and replays of the same event write nothing.
func (e *watchlistEvaluator) evaluateItem(ctx context.Context, item watchlistItem) error {
	desired := models.WatchlistStatus{
		State:   "evaluated",
		Message: fmt.Sprintf("%d pattern(s) watched", len(item.Spec.Patterns)),
	}

	if item.Status == desired {
		return nil
	}

	if err := e.collection.WriteStatus(ctx, item.Name, desired); err != nil {
		return fmt.Errorf("write status: %w", err)
	}
	return nil
}
