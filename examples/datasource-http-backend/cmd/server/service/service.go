package service

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
	"time"
)

type Service struct {
	http.Handler
}

// metrics is a struct containing a slice of dataPoint
type metrics struct {
	DataPoints []dataPoint `json:"datapoints"`
}

// dataPoint is a single data point with a timestamp and a float value
type dataPoint struct {
	Time  time.Time `json:"time"`
	Value float64   `json:"value"`
}

// getMetrics is an handlerFunc that writes dummy metrics in JSON format
// back to the client
func getMetrics(w http.ResponseWriter, req *http.Request) error {
	const pointsN = 1024
	points := make([]dataPoint, pointsN)
	multiplier := req.URL.Query().Get("multiplier")
	multiplierInt := 1
	if multiplier != "" {
		var err error
		multiplierInt, err = strconv.Atoi(multiplier)
		if err != nil {
			return err
		}
	}
	for i := 0; i < pointsN; i++ {
		ts := time.Now().Add(time.Second * time.Duration(-i)).UTC()
		points[i].Time = ts
		points[i].Value = math.Sin(float64(ts.Unix())/10) * float64(multiplierInt)
	}
	w.Header().Add("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(metrics{
		DataPoints: points,
	})
}

// NewService returns a new Service with a /metrics handler that returns
// some dummy metrics in JSON format
func NewService() Service {
	mux := http.NewServeMux()
	svc := Service{mux}
	mux.HandleFunc("/metrics", svc.handleError(getMetrics))
	return svc
}

// handlerFunc is a similar to http.HandlerFunc, but it returns an error
type handlerFunc func(w http.ResponseWriter, req *http.Request) error

// handleError is a function that takes a handlerFunc h and returns a 500 error
// to the client with a generic "error" response body if h returns a non-nil error
func (s *Service) handleError(h handlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		log.Println(req.Method, req.URL.String())
		if err := h(w, req); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			if _, err := w.Write([]byte("error")); err != nil {
				log.Printf("error writing error: %s", err)
			}
		}
	}
}
