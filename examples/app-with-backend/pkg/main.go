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
	//   * route writes to declared object types through the typed
	//     Validate()/Mutate() methods on the spec types at runtime
	//   * deliver change events to any object types the backend watches
	//     (no declaration needed — watching is the signal; see the
	//     Foo watcher in pkg/plugin/foo_watcher.go)
	//
	// Plugin author only edits this declaration; no separate generator
	// file, no separate write-hook dispatcher.
	//
	// Today only StoredObjects is reflected end-to-end. Queries reflect
	// today in the SDK but are only relevant for datasource plugins. Settings
	// and Routes are still hand-authored — the commented blocks below
	// sketch what their declarations would look like once the SDK adds
	// typed surfaces for them. The shape stays consistent: one slice or
	// pointer per surface, Go types via reflect, optional Validate/Mutate
	// methods on the typed values.
	if err := app.Manage("myorg-backend-app", plugin.NewApp, app.ManageOpts{
		Schema: &app.Schema{
			ScanCode: []schemabuilder.CodePaths{
				{
					BasePackage: "github.com/myorg/backend/pkg/models",
					CodePath:    "./pkg/models",
				},
			},

			// Stored objects — reflected today.
			StoredObjects: []schemabuilder.StoredObjectInfo{
				{
					Name:     "Foo",
					SpecType: reflect.TypeOf(models.FooSpec{}),
					// StatusType is optional: declaring it publishes the shape
					// the plugin backend writes to status, so storage can
					// validate it separately from the user-authored spec.
					StatusType: reflect.TypeOf(models.FooStatus{}),
					Validation: []pluginschema.Operation{
						pluginschema.OperationCreate,
						pluginschema.OperationUpdate,
					},
					Mutation: []pluginschema.Operation{
						pluginschema.OperationCreate,
					},
				},
			},

			// ----------------------------------------------------------------
			// VISION (not yet implemented in the SDK).
			//
			// What follows is what the same author surface would look like
			// once settings and routes gain reflection. Each block depends
			// on a typed surface the SDK doesn't expose yet; the shape on
			// this side stays identical to StoredObjects above.
			// ----------------------------------------------------------------

			// Settings — not yet reflected. Today the settings shape is
			// hand-authored in pluginschema.Settings.Spec. To make this
			// reflectable the SDK would need to own a typed settings
			// contract: the dev declares a Go struct (with an optional
			// nested *Secrets field for secureJsonData) and the SDK
			// reflects it into the artifact's settings schema and routes
			// settings writes through its Validate()/Mutate() methods at
			// runtime (same pattern as StoredObjects).
			//
			// What the plugin author would write:
			//
			/*
				// pkg/models/settings.go
				package models

				import (
					"errors"
					"strings"
				)

				// Settings is the typed jsonData shape this plugin expects.
				type Settings struct {
					BackendURL string `json:"backendURL" jsonschema:"required,format=uri"`

					// Secrets is populated by the SDK from secureJsonData
					// after decode. Field json tags become the artifact's
					// secure-value keys.
					Secrets *Secrets `json:"-"`
				}

				type Secrets struct {
					APIKey string `json:"apiKey" jsonschema:"required"`
				}

				func (s *Settings) Validate() error {
					if !strings.HasPrefix(s.BackendURL, "https://") {
						return errors.New("backendURL must use https")
					}
					if s.Secrets == nil || s.Secrets.APIKey == "" {
						return errors.New("apiKey is required")
					}
					return nil
				}

				func (s *Settings) Mutate() error {
					s.BackendURL = strings.TrimSpace(s.BackendURL)
					return nil
				}
			*/
			//
			// And the registration on ManageOpts.Schema:
			//
			// Settings: &schemabuilder.SettingsInfo{
			// 	SettingsType: reflect.TypeOf(models.Settings{}),
			// },

			// Routes — not yet reflected. Today routes are declared in
			// pluginschema.Routes and handled at runtime via the generic
			// CallResourceHandler with internal switch-on-path dispatching.
			// To make routes reflectable, the SDK would need a typed router
			// registration (because http.ServeMux carries no type info to
			// reflect on). The dev writes typed request/response structs
			// and a typed handler; reflection picks up the path, method,
			// and types and ships them in the artifact:
			//
			// Routes: []schemabuilder.RouteInfo{
			// 	{
			// 		Path:         "/foos/{name}/import",
			// 		Method:       http.MethodPost,
			// 		RequestType:  reflect.TypeOf(models.FooImportRequest{}),
			// 		ResponseType: reflect.TypeOf(models.FooImportResponse{}),
			// 		Handler:      handlers.ImportFoo,
			// 	},
			// },
		},
	}); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
