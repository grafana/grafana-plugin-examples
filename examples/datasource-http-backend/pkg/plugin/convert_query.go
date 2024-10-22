package plugin

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/grafana/datasource-http-backend/pkg/kinds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// convertQuery parses a given DataQuery and migrates it if necessary.
func convertQuery(orig backend.DataQuery) (*kinds.DataQuery, error) {
	input := &kinds.DataQuery{}
	err := json.Unmarshal(orig.JSON, input)
	if err != nil {
		return nil, fmt.Errorf("unmarshal: %w", err)
	}
	if input.Multiplier != 0 && input.Multiply == 0 {
		input.Multiply = input.Multiplier
		input.Multiplier = 0
	}
	return input, nil
}

// handleMigrateQuery handles the migration of a query.
func handleMigrateQuery(rw http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		rw.WriteHeader(http.StatusNotFound)
		return
	}

	defer req.Body.Close()
	queryJSON, err := io.ReadAll(req.Body)
	if err != nil {
		http.Error(rw, fmt.Sprintf("read body: %s", err), http.StatusBadRequest)
		return
	}
	query := &backend.DataQuery{}
	err = json.Unmarshal(queryJSON, query)
	if err != nil {
		http.Error(rw, fmt.Sprintf("unmarshal: %s", err), http.StatusBadRequest)
		return
	}
	query.JSON = queryJSON
	input, err := convertQuery(*query)
	if err != nil {
		http.Error(rw, fmt.Sprintf("migrate query: %s", err), http.StatusBadRequest)
		return
	}
	err = json.NewEncoder(rw).Encode(input)
	if err != nil {
		http.Error(rw, fmt.Sprintf("encode response: %s", err), http.StatusInternalServerError)
		return
	}
	rw.WriteHeader(http.StatusOK)
}
