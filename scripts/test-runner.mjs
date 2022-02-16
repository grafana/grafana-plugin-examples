#!/usr/bin/env zx

$.verbose = false;

const latestGrafana = await fetch(
  "https://raw.githubusercontent.com/grafana/grafana/main/latest.json"
);

if (latestGrafana.ok) {
  const latestGrafanaJson = await latestGrafana.json();
  const stableVersion = latestGrafanaJson.stable;

  // Ideally we'd use workspaces but the @grafana/e2e package doesn't support them
  // so we'll glob for package.json to discover examples...
  const examplePackageJsons = await glob(["examples/*/package.json"], {
    absolute: true,
  });

  for (const packageJson of examplePackageJsons) {
    const { name, scripts } = require(packageJson);
    if (scripts && "e2e" in scripts) {
      const exampleDir = path.dirname(packageJson);
      cd(exampleDir);
      console.log(`${name} has e2e tests!`);
      $.verbose = true;
      await $`yarn install`;

      // Build with the provided version of Grafana packages and test against provided version of Grafana
      await $`yarn build`;
      await $`yarn server:expected`;
      await $`yarn e2e`;
      await $`docker-compose down`;

      // Build with the provided version of Grafana packages and test against latest version of Grafana
      process.env.GRAFANA_VERSION = stableVersion;
      await $`docker-compose up -d --build`;
      await $`yarn e2e`;
      await $`docker-compose down`;

      // Build with the latest version of Grafana packages and test against latest version of Grafana
      await $`yarn upgrade --latest --scope @grafana`;
      await $`yarn build`;
      // reuse the previous "latest" docker image
      await $`docker-compose up -d`;
      await $`yarn e2e`;
      await $`docker-compose down`;
    }
  }
}
