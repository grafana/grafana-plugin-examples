package grafanaplugin

import (
	"github.com/grafana/thema"
	ui "github.com/grafana/grafana/packages/grafana-schema/src/schema"
)

Panel: thema.#Lineage & {
	name: "basic-panel"
	seqs: [
		{
			schemas: [
				{
          PanelOptions: {
					  ui.OptionsWithLegend
          }, // tried to use @cuetsy(kind="interface") but makes the cli to fail
          PanelFieldConfig: {
            ...
          }, // tried to use @cuetsy(kind="interface") but makes the cli to fail
				},
			]
		},
	]
}
