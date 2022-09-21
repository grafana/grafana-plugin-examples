# Finding docker image tag to use during testing

This action uses the docker hub registry API to figure out what grafana-dev docker image we should use during plugin example testing.

If the grafana/grafana build fails after the npm packages are published but before the docker image is published we will end up out of sync between docker hub and npm.

In that scenaro we tries to find next available docker image tag. Since we only publish the grafana npm packages when there are changes to the grafana/packages/**/* directory. There can be a lot of commits before a new npm package is published.

This script will find the next available docker image tag based on the npm canary tag.

## Example usage

uses: ./.github/actions/npm-to-docker-image
with:
  npm-tag: '9.0.0-67700pre'
