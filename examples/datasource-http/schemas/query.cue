package grafanaplugin

import "github.com/grafana/thema"

Query: thema.#Lineage & {
	name: "example-http-datasource"
	seqs: [
		{
			schemas: [
				{
          queryText?: string
          constant: number
				},
			]
		},
	]
}
