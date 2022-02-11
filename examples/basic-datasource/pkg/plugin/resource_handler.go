package plugin

import (
	"encoding/json"
	"net/http"

	"github.com/grafana/basic-datasource/pkg/query/scenario"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
)

func newResourceHandler() backend.CallResourceHandler {
	mux := http.NewServeMux()
	mux.HandleFunc("/query-types", handleQueryTypes)

	return httpadapter.New(mux)
}

type queryTypesResponse struct {
	QueryTypes []string `json:"queryTypes"`
}

func handleQueryTypes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}

	queryTypes := &queryTypesResponse{
		QueryTypes: []string{
			scenario.TimeSeries,
			scenario.Table,
		},
	}

	j, err := json.Marshal(queryTypes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = w.Write(j)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
