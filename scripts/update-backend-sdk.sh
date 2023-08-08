#!/bin/bash

if [ "$1" == "--help" ]; then
  echo "Usage: $0 [vX.Y.Z]"
  echo "(defaults to latest version if not specified)"
  exit 0
fi

SDK_TARGET="$1"

# Keep track of base directory
base=$(pwd)

# Find go.mod files (backend plugins)
files=$(find examples -type f -name "go.mod")

# Iterate over each file and run `go get` to upgrade the grafana-plugin-sdk-go dependency
for file in $files; do
  echo "Upgrading grafana-plugin-sdk-go to ${SDK_TARGET:-latest} in $file"
  
  cd $(dirname "$file")
  if [ ! -z "$SDK_TARGET" ]; then
    go get "github.com/grafana/grafana-plugin-sdk-go@$SDK_TARGET"
  else
    go get -u github.com/grafana/grafana-plugin-sdk-go
  fi
  go mod tidy

  # Return to base directory
  cd "$base"
done