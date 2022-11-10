package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/cuecontext"
	"github.com/grafana/thema"
	"github.com/grafana/thema/encoding/typescript"
	"github.com/grafana/thema/load"
)

func main() {
	//outputDirFlag := flag.String("o", ".", "output directory")
	inputDirFlag := flag.String("i", ".", "input (cuefile) directory")
	//formatFlag := flag.String("f", "ts", "file format ('ts' or 'go')")
	flag.Usage = func() {
		fmt.Fprintf(flag.CommandLine.Output(), "Usage: %s [flags] [...cue selectors]\nAllowed flags:\n", os.Args[0])
		flag.PrintDefaults()
	}
	flag.Parse()

	inst, err := load.InstancesWithThema(os.DirFS(*inputDirFlag), ".")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	rt := thema.NewRuntime(cuecontext.New())
	root := rt.Context().BuildInstance(inst)
	if root.Err() != nil {
		log.Fatalln("failed to build instance", "error", err)
	}
	if !root.Exists() {
		log.Fatalln("unable to load Instance")
	}

	panelLineage, err := getPanelLineage(rt, root)
	if err != nil {
		log.Println("Failed to get panel lineage", "error", err)
	}

	if panelLineage != nil {
		generateAndPrintTypeScriptForLineage(panelLineage)
	}

	getQueryLineage, err := getQueryLineage(rt, root)
	if err != nil {
		log.Println("Failed to get panel lineage", "error", err)
	}

	if getQueryLineage != nil {
		generateAndPrintTypeScriptForLineage(getQueryLineage)
	}
}

func getPathFromString(selector string) cue.Path {
	parts := strings.Split(selector, ".")
	selectors := make([]cue.Selector, 0)
	for _, p := range parts {
		selectors = append(selectors, cue.Str(p))
	}
	return cue.MakePath(selectors...)
}

func getPanelLineage(rt *thema.Runtime, root cue.Value) (thema.Lineage, error) {
	val := root.LookupPath(getPathFromString("Panel"))
	if err := val.Err(); err != nil {
		return nil, fmt.Errorf("no Panel lineage found: %v", err)
	}

	lin, err := thema.BindLineage(val, rt)
	if err != nil {
		return nil, fmt.Errorf("failed to bind Panel lineage: %v", err)
	}

	return lin, nil
}

func getQueryLineage(rt *thema.Runtime, root cue.Value) (thema.Lineage, error) {
	val := root.LookupPath(getPathFromString("Query"))
	if err := val.Err(); err != nil {
		return nil, fmt.Errorf("no Query lineage found: %v", err)
	}

	lin, err := thema.BindLineage(val, rt)
	if err != nil {
		return nil, fmt.Errorf("failed to bind Query lineage: %v", err)
	}

	return lin, nil
}

func generateAndPrintTypeScriptForLineage(lin thema.Lineage) {
	sch := thema.SchemaP(lin.Latest().Lineage(), lin.Latest().Version())
	f, err := typescript.GenerateTypes(sch, &typescript.TypeConfig{})
	if err != nil {
		log.Printf("failed to generate TypeScript: %v", err)
		return
	}

	log.Printf("Generated TypeScript: %v\n", f)
}

// Reader - reads the cue package and return all the cue values
//
// Encoder - takes a cue value and encodes it into a specific language
//           lineage -> typescript
//           lineage -> golang
//           cuetsy -> typescript
//           cuetsy -> golang
