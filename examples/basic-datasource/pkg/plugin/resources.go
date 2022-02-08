package plugin

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/grafana/basic-datasource/pkg/scenario"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
)

func newResourceHandler() backend.CallResourceHandler {
	mux := http.NewServeMux()
	mux.HandleFunc("/scenarios", handleScenarios)

	return httpadapter.New(mux)
}

type scenariosResponse struct {
	Scenarios []scenario.ScenarioType `json:"scenarios"`
}

func handleScenarios(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}

	scenarios := &scenariosResponse{
		Scenarios: []scenario.ScenarioType{
			scenario.TimeSeries,
			scenario.Table,
		},
	}

	j, err := json.Marshal(scenarios)
	if err != nil {
		msg := fmt.Sprintf(`{ error: "%s" }`, err.Error())
		w.Write([]byte(msg))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	_, err = w.Write(j)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
