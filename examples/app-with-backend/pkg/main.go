package main

import (
	"os"
	"reflect"

	"github.com/grafana/grafana-plugin-sdk-go/backend/app"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/pluginschema"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/schemabuilder"

	"github.com/myorg/backend/pkg/models"
	"github.com/myorg/backend/pkg/plugin"
)

func main() {
	// app.Manage is the plugin entry point. The Schema field declares typed
	// surfaces this plugin owns. The SDK uses these declarations to:
	//   * generate dist/schema/v0alpha1.json at build time (via the mage
	//     schema:gen target, which invokes this binary with the
	//     GF_PLUGIN_PRINT_SCHEMA env var set)
	//   * derive an admission handler at runtime that dispatches by Kind to
	//     the typed Validate()/Mutate() methods on the spec types
	//
	// Plugin author only edits this declaration; no separate generator
	// file, no separate admission dispatcher.
	if err := app.Manage("myorg-backend-app", plugin.NewApp, app.ManageOpts{
		Schema: &app.Schema{
			ScanCode: []schemabuilder.CodePaths{
				{
					BasePackage: "github.com/myorg/backend/pkg/models",
					CodePath:    "./pkg/models",
				},
			},
			StoredObjects: []schemabuilder.StoredObjectInfo{
				{
					Name:     "Watchlist",
					Scope:    pluginschema.ScopeNamespaced,
					SpecType: reflect.TypeOf(models.WatchlistSpec{}),
					Validation: []pluginschema.AdmissionOperation{
						pluginschema.AdmissionOperationCreate,
						pluginschema.AdmissionOperationUpdate,
					},
					Mutation: []pluginschema.AdmissionOperation{
						pluginschema.AdmissionOperationCreate,
					},
				},
			},
		},
	}); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
