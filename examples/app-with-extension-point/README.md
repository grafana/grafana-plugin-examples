# Grafana App Plugin which adds a plugin UI extension point

This example demonstrates how to add a plugin extension point that can be extended by other plugins. It works by bundling three different app plugins within the same bundle. First we have the `myorg-extensionpoint-app` that creates an extension point. Then we have the `src/plugins/myorg-a-app` and `src/plugins/myorg-b-app` that extends the `myorg-extensionpoint-app` UI with links.

> The way we have nested app plugins in this example is not recommended to use in production.

## Guides in this example

| **Example**                                                      | **Source**       |
| ---------------------------------------------------------------- | ---------------- |
| [Add an extension point](#add-an-extension-point) | [`App.ts#L12-18`](./src/components/App/App.tsx#L12-18) |

### Add an extension point

**Example:** [`App.ts#L12-18`](./src/components/App/App.tsx#L12-18)

1. Define an ID for your extension point. Each extension point needs an unique identifier that other plugins can reference when adding extensions. It should be in the following format: `plugins/<your-plugin-id>/<extension-name>`, where:

  - `<your-plugin-id>` is the full ID of your plugin, e.g., `"myorg-b-app"`
  - `<extension-name>` is an identifier for the extension point, unique inside your plugin, e.g. `"header"`

2. Call `getPluginExtensions` with the defined `pluginExtensionId` and Grafana will return all extensions added for that placement.

  ```typescript
  const placement = 'plugins/myorg-extensionpoint-app/actions';
  const context: AppExtensionContext = {};

  const { extensions } = getPluginExtensions({
    placement,
    context,
  });
  ```

---
