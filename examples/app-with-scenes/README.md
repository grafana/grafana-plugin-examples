# Grafana Scenes App Plugin example

This example demonstrates how to build a basic app plugin using @grafana/scenes framework.

## What are Grafana app plugins?

App plugins can let you create a custom out-of-the-box monitoring experience by custom pages, nested data sources, and panel plugins.

## What is @grafana/scenes

[@grafana/scenes](https://github.com/grafana/scenes) is a framework to enable versatile app plugins implementation. It provides an easy way to build apps that resemble Grafana dashboards, including template variables support, versatile layouts, panel rendering, and more.

To learn more about @grafana/scenes usage please refer to [documentation](https://grafana.com/developers/scenes)

## What does this template contain?

1. An example of a simple scene. See [Home scene](./src/pages/Home/Home.tsx)
1. An example of a scene with tabs. See [Scene with tabs](./src/pages/WithTabs/WithTabs.tsx)
1. An example of a scene with drill down. See [Scene with drill down](./src/pages/WithDrilldown/WithDrilldown.tsx)

## Developing app plugin with this template

To run the plugin in development:

1. Install dependencies (`yarn install`)
1. Run the plugin (`yarn dev`)
1. Run Grafana with Docker compose (`docker compose up -d`)
1. Go to [http://localhost:3000/a/myorg-scenes-app/](http://localhost:3000/a/myorg-scenes-app/).

For more details, refer to `package.json`, `docker-compose.yaml`, and the provisioning directory.
