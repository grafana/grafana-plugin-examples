#!/bin/bash
#
GRAFANA_VERSION_TARGET=${1:-10.0.3}

# fail this script if jq is not installed
command -v jq >/dev/null 2>&1 || { echo >&2 "jq is required but it's not installed.  Aborting."; exit 1; }

dirs=$(find examples -type f -name 'package.json' -not -path '*/node_modules/*' -exec dirname {} \;)


# Specify the packages for version upgrade
upgradePackages=(
    "@grafana/data"
    "@grafana/runtime"
    "@grafana/schema"
    "@grafana/ui"
    "@grafana/e2e"
    "@grafana/e2e-selectors"
)

# Iterate over each directory
for dir in $dirs; do
  # Extract the dependencies and devDependencies starting with '@grafana' from the package.json
  dependencies=$(jq -r '.dependencies | to_entries | map(select(.key | startswith("@grafana"))) | .[].key' "$dir/package.json")
  devDependencies=$(jq -r '.devDependencies | to_entries | map(select(.key | startswith("@grafana"))) | .[].key' "$dir/package.json")

  # Concatenate the dependencies and devDependencies
  allDependencies="$dependencies $devDependencies"

  upgradeCommand=""
  for dep in $allDependencies; do
        upgradeFlag=false
        for pkg in "${upgradePackages[@]}"; do
            if [ "$dep" = "$pkg" ]; then
                upgradeFlag=true
                break
            fi
        done

        if $upgradeFlag; then
            upgradeCommand+="$dep@$GRAFANA_VERSION_TARGET "
        else
            upgradeCommand+="$dep@latest "
        fi
    done
  pushd "$dir" || exit 1
  yarn install
  yarn upgrade $upgradeCommand
  popd || exit 1
done
