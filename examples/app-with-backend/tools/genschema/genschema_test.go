package genschema

import (
	"reflect"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/experimental/pluginschema"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/schemabuilder"
	"github.com/stretchr/testify/require"

	"github.com/myorg/backend/pkg/models"
)

// TestGenerateSchema rebuilds the plugin schema artifact under src/schema/.
// It runs as a test so changes to the typed schema fail CI until the
// regenerated artifact is committed alongside the source change. Mirrors the
// pattern used by AddQueries-based generators in upstream plugins.
func TestGenerateSchema(t *testing.T) {
	builder, err := schemabuilder.NewSchemaBuilder(schemabuilder.BuilderOptions{
		PluginID: []string{"myorg-backend-app"},
		ScanCode: []schemabuilder.CodePaths{
			{
				BasePackage: "github.com/myorg/backend/pkg/models",
				CodePath:    "../../pkg/models",
			},
		},
	})
	require.NoError(t, err)

	err = builder.AddStoredObjects([]schemabuilder.StoredObjectInfo{
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
	})
	require.NoError(t, err)

	builder.UpdateProviderFiles(t, "v0alpha1", "../../src/schema")
}
