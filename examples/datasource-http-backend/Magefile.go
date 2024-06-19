//go:build mage
// +build mage

package main

import (
	// mage:import
	build "github.com/grafana/grafana-plugin-sdk-go/build"
	"github.com/magefile/mage/sh"
)

// Default configures the default target.
var Default = build.BuildAll

// TestAll runs all test for the backend (go test ./...), it's different than 'test', which runs tests only
// in the pkg package.
func TestAll() error {
	return sh.RunV("go", "test", "./...")
}
