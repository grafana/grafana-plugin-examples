#!/usr/bin/env zx

$.verbose = false;

const latestGrafana = await fetch(
  "https://raw.githubusercontent.com/grafana/grafana/main/latest.json"
);

if (latestGrafana.ok) {
  const latestGrafanaJson = await latestGrafana.json();
  const stableVersion = latestGrafanaJson.stable;
  const nextVersion = latestGrafanaJson.testing;

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
      await $`yarn build`;
      // Run tests against the expected version of grafana
      await $`yarn server:expected`;
      await $`yarn e2e`;
      await $`docker-compose down`;
      // Run tests against the latest version of grafana
      process.env.GRAFANA_VERSION = stableVersion;
      await $`docker-compose up -d --build`;
      await $`yarn e2e`;
      await $`docker-compose down`;
      // Run tests against the next version of grafana
      process.env.GRAFANA_VERSION = nextVersion;
      await $`docker-compose up -d --build`;
      await $`yarn e2e`;
      await $`docker-compose down`;
    }
  }
}
