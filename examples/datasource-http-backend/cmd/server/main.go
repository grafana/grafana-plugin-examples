package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/grafana/datasource-http-backend/cmd/server/service"
)

const defaultListenAddr = ":10000"

func main() {
	// Listen address
	addr := defaultListenAddr
	if len(os.Args) > 1 {
		addr = os.Args[1]
	}

	// Start server
	log.Println("listening on", addr)
	if err := http.ListenAndServe(addr, service.NewService().Handler); err != nil {
		panic(fmt.Errorf("listen and serve: %w", err))
	}
}
