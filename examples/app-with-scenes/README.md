# Grafana Scenes App Plugin Template

This example demonstrates how to build a basic app plugin using @grafana/scenes framework.

## What are Grafana app plugins?

App plugins can let you create a custom out-of-the-box monitoring experience by custom pages, nested datasources and panel plugins.

## What is @grafana/scenes

[@grafana/scenes](https://github.com/grafana/scenes) is a framework to enable versatile app plugins implementation. It provides an easy way to build apps that resemble Grafana's dashboarding experience, including template variables support, versatile layouts, panels rendering and more.

To learn more about @grafana/scenes usage please refer to [documentation](https://grafana.com/developers/scenes)

## What does this template contain?

1. An example of a simple scene. See [Home scene](./src/pages/Home/Home.tsx)
1. An example of a scene with tabs. See [Scene with tabs](./src/pages/WithTabs/WithTabs.tsx)
1. An example of a scene with drill down. See [Scene with drill down](./src/pages/WithDrilldown/WithDrilldown.tsx)

## Developing app plugin with this template

To run the plugin in development:

1. Install dependencies (`yarn install`)
1. Run the plugin (`yarn dev`)
1. Run Grafana with docker compose (`docker compose up -d`)
1. Navigate to [http://localhost:3000/a/myorg-scenes-app/](http://localhost:3000/a/myorg-scenes-app/)

For more details, checkout `package.json`, `docker-compose.yaml`, and the provisioning directory.
