#!/bin/bash

if [ "$1" == "--help" ]; then
  echo "Usage: $0 [vX.Y.Z]"
  echo "(defaults to latest version if not specified)"
  exit 0
fi

SDK_TARGET="${1:-latest}"

# Find go.mod files (backend plugins)
files=$(find examples -type f -name "go.mod")

# Iterate over each file and run `go get` to upgrade the grafana-plugin-sdk-go dependency
for file in $files; do
  echo "Upgrading grafana-plugin-sdk-go to $SDK_TARGET in $file"

  pushd $(dirname "$file") || exit 1
  go get -u "github.com/grafana/grafana-plugin-sdk-go@$SDK_TARGET"
  go mod tidy

  # Return to base directory
  popd || exit 1
done