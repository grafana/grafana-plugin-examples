# Grafana Scenes App Plugin LLM example

This example demonstrates how to build a basic app plugin using @grafana/scenes framework that integrates with Grafana's large language model API.

## What are Grafana app plugins?

App plugins can let you create a custom out-of-the-box monitoring experience by custom pages, nested data sources, and panel plugins.

## What is @grafana/scenes

[@grafana/scenes](https://github.com/grafana/scenes) is a framework to enable versatile app plugins implementation. It provides an easy way to build apps that resemble Grafana dashboards, including template variables support, versatile layouts, panel rendering, and more.

To learn more about @grafana/scenes usage please refer to [documentation](https://grafana.com/developers/scenes)

## What is the Grafana LLM app?

[Grafana LLM app](https://grafana.com/grafana/plugins/grafana-llm-app/) is a Grafana application plugin centralizes access to LLMs across Grafana.

## What does this template contain?

1. An example of a scene with tabs showcasing a basic and more advanced LLM implementation. See [Scene with LLM integration](./src/pages/Home/Home.tsx)

## Developing app plugin with this template

To run the plugin in development:

1. Install dependencies (`npm install`)
1. Run the plugin (`npm run dev`)
1. Run Grafana with Docker compose (`docker compose up -d`)
1. Go to [http://localhost:3000/a/myorg-scenes-app/](http://localhost:3000/a/myorg-scenes-app/).

For more details, refer to `package.json`, `docker-compose.yaml`, and the provisioning directory.
