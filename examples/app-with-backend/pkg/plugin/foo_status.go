package plugin

import (
	"context"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/storedobjects"

	"github.com/myorg/backend/pkg/models"
)

type (
	fooCollection = storedobjects.Collection[models.FooSpec, models.FooStatus]
	fooItem       = storedobjects.Item[models.FooSpec, models.FooStatus]
)

// runFooStatusUpdates keeps Foo status current using the SDK's
// typed stored-object collection. Watch is the opt-in signal for events; once
// it is active, Grafana pushes Foo changes to this plugin process.
func runFooStatusUpdates(ctx context.Context, foos *fooCollection, logger log.Logger) {
	events, err := foos.Watch(ctx)
	if err != nil {
		logger.Error("foo status: watch failed", "error", err)
		return
	}

	for {
		select {
		case <-ctx.Done():
			return
		case ev, ok := <-events:
			if !ok {
				return
			}
			if ev.Type == storedobjects.EventDeleted {
				continue
			}
			if err := updateFooStatus(ctx, foos, ev.Item); err != nil {
				logger.Error("foo status: update failed", "name", ev.Item.Name, "error", err)
			}
		}
	}
}

func updateFooStatus(ctx context.Context, foos *fooCollection, item fooItem) error {
	if item.Status.State == "evaluated" {
		return nil
	}
	status := models.FooStatus{
		State:   "evaluated",
		Message: fmt.Sprintf("%d item(s) configured", len(item.Spec.Items)),
	}
	if err := foos.WriteStatus(ctx, item.Name, status); err != nil {
		return fmt.Errorf("write status: %w", err)
	}
	return nil
}
