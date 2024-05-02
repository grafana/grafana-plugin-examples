#!/bin/bash
#
GRAFANA_VERSION_TARGET=${1:-10.3.1}

# fail this script if jq is not installed
command -v jq >/dev/null 2>&1 || { echo >&2 "jq is required but it's not installed.  Aborting."; exit 1; }


###############################################
# Upgrade @grafana/* dependencies
###############################################
dirs=$(find examples -type f -name 'package.json' -not -path '*/node_modules/*' -exec dirname {} \;)

# Specify the packages for version upgrade
upgradePackages=(
    "@grafana/data"
    "@grafana/runtime"
    "@grafana/schema"
    "@grafana/ui"
)

# Iterate over each directory
for dir in $dirs; do
  # if $dir is the same as the current directory, skip it
  if [ "$dir" = "." ]; then
    echo "Skipping $dir"
    continue
  fi
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

  # detect if a package-lock.json exists
  if [ -f "package-lock.json" ]; then
    echo "package-lock.json exists, running npm install"
    npm install
    echo "upgrading packages with npm install $upgradeCommand"
    npm install --save-exact $upgradeCommand
  fi

  popd || exit 1
done

###############################################
# Upgrade plugin.json files
###############################################


plugin_files=$(find examples -type f -name 'plugin.json' -not -path '*/node_modules/*')

# Iterate over each plugin.json file
for file in $plugin_files; do
    # Get the current value of dependencies.grafanaDependency using jq
    current_dependency=$(jq -r '.dependencies.grafanaDependency' "$file")

    # Modify the property to >$GRAFANA_VERSION_TARGET using jq and update the file
    modified_dependency=$(echo "$current_dependency" | jq -n --arg target ">=$GRAFANA_VERSION_TARGET" '$target')
    jq --argjson modified "$modified_dependency" '.dependencies.grafanaDependency = $modified' "$file" >"$file.tmp" && mv "$file.tmp" "$file"
done

###############################################
# Upgrade docker-compose files
###############################################
# Find the docker-compose.yaml files excluding node_modules
files=$(find examples -type f -name "docker-compose.yaml" -not -path "*node_modules*")

# Iterate over each file and modify the grafana_version field
for file in $files; do
    # Check if the file contains the grafana_version field
    if grep -q "grafana_version:" "$file"; then
        # Replace the grafana_version field with the target version
        # sed -i "s/grafana_version:.*/grafana_version: ${GRAFANA_VERSION_TARGET}/" "$file"
        sed -i "s/\(grafana_version: \)\${GRAFANA_VERSION:-[^}]*}/\1\${GRAFANA_VERSION:-$GRAFANA_VERSION_TARGET}/" "$file"
        echo "Modified $file"
    fi
done


###############################################
# Upgrade grafana-plugin-sdk-go to latest version
###############################################

./scripts/update-backend-sdk.sh
