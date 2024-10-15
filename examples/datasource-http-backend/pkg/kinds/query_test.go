package kinds

import (
	"reflect"
	"testing"

	data "github.com/grafana/grafana-plugin-sdk-go/experimental/apis/data/v0alpha1"
	"github.com/grafana/grafana-plugin-sdk-go/experimental/schemabuilder"
	"github.com/stretchr/testify/require"
)

func TestQueryTypeDefinitions(t *testing.T) {
	builder, err := schemabuilder.NewSchemaBuilder(
		schemabuilder.BuilderOptions{
			PluginID: []string{"example-httpbackend-datasource"},
			ScanCode: []schemabuilder.CodePaths{{
				BasePackage: "github.com/grafana/datasource-http-backend/pkg/kinds",
				CodePath:    "./",
			}},
			Enums: []reflect.Type{},
		})
	require.NoError(t, err)
	err = builder.AddQueries(
		schemabuilder.QueryTypeInfo{
			Name:   "default",
			GoType: reflect.TypeOf(&DataQuery{}),
			Examples: []data.QueryExample{
				{
					Name: "simple multiplier",
					SaveModel: data.AsUnstructured(
						DataQuery{
							Multiplier: 1,
						},
					),
				},
			},
		},
	)

	require.NoError(t, err)
	builder.UpdateQueryDefinition(t, "./")
}
