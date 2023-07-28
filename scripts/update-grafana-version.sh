#!/bin/bash
#
GRAFANA_VERSION_TARGET=${1:-10.0.3}

dirs=$(find examples -type f -name 'package.json' -not -path '*/node_modules/*' -exec dirname {} \;)

# Iterate over each directory
for dir in $dirs; do
  # Extract the dependencies and devDependencies starting with '@grafana' from the package.json
  dependencies=$(jq -r '.dependencies | to_entries | map(select(.key | startswith("@grafana"))) | .[].key' "$dir/package.json")
  devDependencies=$(jq -r '.devDependencies | to_entries | map(select(.key | startswith("@grafana"))) | .[].key' "$dir/package.json")

  # Concatenate the dependencies and devDependencies
  allDependencies="$dependencies $devDependencies"

  Upgrade each dependency to version 10.0.3 using yarn
  upgradeCommand=""
  for dep in $allDependencies; do
    upgradeCommand+="$dep@$GRAFANA_VERSION_TARGET "
  done
  pushd "$dir" || exit 1
  yarn install
  yarn upgrade $upgradeCommand
  popd || exit 1
done
