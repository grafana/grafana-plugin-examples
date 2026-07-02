package plugin

import (
	"context"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/storedobjects"

	"github.com/myorg/backend/pkg/models"
)

// watchlistPlural is the URL plural form of the Watchlist kind, as derived by
// the schema reflector from the kind name declared in pkg/main.go.
const watchlistPlural = "watchlists"

// defaultEvaluationInterval is how often the evaluator re-lists watchlists
// when no interval is injected (tests use a shorter one).
const defaultEvaluationInterval = 30 * time.Second

// watchlistClient is the narrow slice of *storedobjects.Client the evaluator
// needs. Depending on an interface rather than the concrete client lets tests
// inject a fake without any HTTP machinery.
type watchlistClient interface {
	List(ctx context.Context, namespace, plural string) (*storedobjects.List, error)
	UpdateStatus(ctx context.Context, namespace, plural, name string, status any) (*storedobjects.Object, error)
}

var _ watchlistClient = (*storedobjects.Client)(nil)

// watchlistEvaluator demonstrates the "operator pattern" for stored objects
// in plugin idiom: a background goroutine that periodically lists the
// plugin's Watchlist objects and writes their observed state to the status
// subresource. There are no informers and no controller runtime — just a
// list-evaluate-patch loop over the plugin's own HTTP API. Note the limits:
// each Grafana replica runs its own plugin process and therefore its own
// evaluator, so concurrent (duplicate) status writes are possible. The loop
// tolerates that because every write is idempotent: status is computed purely
// from spec, and unchanged status is never written at all.
type watchlistEvaluator struct {
	client    watchlistClient
	namespace string
	interval  time.Duration
	logger    log.Logger

	// ticks, when non-nil, replaces the interval ticker so tests can drive
	// the loop deterministically instead of sleeping.
	ticks <-chan time.Time
}

// newWatchlistEvaluator creates an evaluator for the given namespace using
// the default evaluation interval.
func newWatchlistEvaluator(client watchlistClient, namespace string, logger log.Logger) *watchlistEvaluator {
	return &watchlistEvaluator{
		client:    client,
		namespace: namespace,
		interval:  defaultEvaluationInterval,
		logger:    logger,
	}
}

// run evaluates once immediately, then on every tick, and blocks until ctx is
// canceled. Evaluation errors are logged and swallowed: a failed pass must
// not kill the loop, because the next tick gets a fresh chance to converge.
func (e *watchlistEvaluator) run(ctx context.Context) {
	e.evaluate(ctx)

	ticks := e.ticks
	if ticks == nil {
		ticker := time.NewTicker(e.interval)
		defer ticker.Stop()
		ticks = ticker.C
	}

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticks:
			e.evaluate(ctx)
		}
	}
}

// evaluate performs a single pass: list all watchlists in the namespace and
// reconcile each one's status. Per-item failures are logged and skipped so
// one bad object cannot starve the rest.
func (e *watchlistEvaluator) evaluate(ctx context.Context) {
	list, err := e.client.List(ctx, e.namespace, watchlistPlural)
	if err != nil {
		e.logger.Error("watchlist evaluation: list failed", "namespace", e.namespace, "error", err)
		return
	}

	for i := range list.Items {
		obj := &list.Items[i]
		if err := e.evaluateItem(ctx, obj); err != nil {
			e.logger.Error("watchlist evaluation: item failed", "name", obj.Metadata.Name, "error", err)
		}
	}
}

// evaluateItem computes the desired status from the object's spec and writes
// it only when it differs from what is already stored.
func (e *watchlistEvaluator) evaluateItem(ctx context.Context, obj *storedobjects.Object) error {
	var spec models.WatchlistSpec
	if err := obj.SpecInto(&spec); err != nil {
		return fmt.Errorf("decode spec: %w", err)
	}

	desired := models.WatchlistStatus{
		State:   "evaluated",
		Message: fmt.Sprintf("%d pattern(s) watched", len(spec.Patterns)),
	}

	// Level-triggered reconcile: writing only on drift keeps the loop
	// idempotent and cheap. A StatusInto error (e.g. no status yet) simply
	// counts as drift.
	var current models.WatchlistStatus
	if err := obj.StatusInto(&current); err == nil && current == desired {
		return nil
	}

	if _, err := e.client.UpdateStatus(ctx, e.namespace, watchlistPlural, obj.Metadata.Name, desired); err != nil {
		return fmt.Errorf("update status: %w", err)
	}
	return nil
}
