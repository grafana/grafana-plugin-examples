//go:build mage
// +build mage

package main

import (
	"github.com/magefile/mage/mg"

	// mage:import
	build "github.com/grafana/grafana-plugin-sdk-go/build"
)

// Default regenerates the plugin schema artifact and then builds the plugin
// for every supported platform. Wiring Schema:Gen as a serial dependency of
// the build means model changes can't be shipped with a stale artifact —
// every `mage` invocation refreshes src/schema/ before compiling.
//
// Schema:Gen is opt-in at the plugin level (this file); plugins that don't
// declare typed surfaces stay on `var Default = build.BuildAll` and skip
// regeneration entirely.
func Default() {
	mg.SerialDeps(build.Schema{}.Gen, build.BuildAll)
}
