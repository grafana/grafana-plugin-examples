#!/bin/bash
#
GRAFANA_VERSION_TARGET=${1:-10.3.1}

dirs=$(find examples -type f -name 'package.json' -not -path '*/node_modules/*' -exec dirname {} \;)
for plugin in $dirs; do
    if [ -d "$plugin" ]; then  # Check if it is indeed a directory
        echo "Processing plugin folder: $plugin"
        # Run the npx command in the plugin directory
        (cd "$plugin" && npx @grafana/create-plugin@latest update --force && npm install (cd "$plugin" && npx @grafana/create-plugin@latest update --force && npm install && rm -rf node_modules))
    fi
done

###############################################
# Upgrade plugin.json files
###############################################


plugin_files=$(find examples -type f -name 'plugin.json' -not -path '*/node_modules/*')

# Iterate over each plugin.json file
for file in $plugin_files; do
    # Get the current value of dependencies.grafanaDependency using jq
    current_dependency=$(jq -r '.dependencies.grafanaDependency' "$file")
    target_version=$(get_newer_version "$(echo $current_dependency | sed -n 's|[=<>~!]*\([0-9]*.[0-9]*.[0-9]*\)|\1|p')" "$GRAFANA_VERSION_TARGET")
    # Modify the property to >$GRAFANA_VERSION_TARGET using jq and update the file
    modified_dependency=$(echo "$current_dependency" | jq -n --arg target ">=$target_version" '$target')
    jq --argjson modified "$modified_dependency" '.dependencies.grafanaDependency = $modified' "$file" >"$file.tmp" && mv "$file.tmp" "$file"
done

###############################################
# Upgrade docker-compose files
###############################################
# Find the docker-compose.yaml files excluding node_modules
files=$(find examples -maxdepth 2 -type f -name "docker-compose.yaml" -not -path "*node_modules*")
# Make a wrapper to support Linux and MacOS
case $(sed --help 2>&1) in
  *GNU*) sed_i () { sed -i "$@"; };;
  *) sed_i () { sed -i '' "$@"; };;
esac

get_newer_version () { printf "%s\n" "$@" | sort --version-sort | tail -1 ; }
# Iterate over each file and modify the grafana_version field
for file in $files; do
    # Check if the file contains the grafana_version field
    if grep -q "grafana_version:" "$file"; then
        # Replace the grafana_version field with the target version
        # sed -i "s/grafana_version:.*/grafana_version: ${GRAFANA_VERSION_TARGET}/" "$file"
        sed_i "s/\(grafana_version: \)\${GRAFANA_VERSION:-[^}]*}/\1\${GRAFANA_VERSION:-$target_version}/" "$file"
        echo "Modified $file"
    fi
done


###############################################
# Upgrade grafana-plugin-sdk-go to latest version
###############################################

./scripts/update-backend-sdk.sh
