# Grafana App Plugin which adds a plugin UI extension point

This example demonstrates how to add a plugin extension point that can be extended by other plugins. It works by bundling three different app plugins within the same bundle. First we have the `myorg-extensionpoint-app` that creates an extension point. Then we have the `src/plugins/myorg-a-app` and `src/plugins/myorg-b-app` that extends the `myorg-extensionpoint-app` UI with links.

> The way we have nested app plugins in this example is not recommended to use in production.

## Guides in this example

| **Example**                                                      | **Source**       |
| ---------------------------------------------------------------- | ---------------- |
| [How to add an extension point?](#how-to-add-an-extension-point) | [App.tsx#L12-18] |

### How to add an extension point?

**Example:** [App.tsx#L12-18]

The first thing you need to do is to define a id for your extension point. Each extension point needs an unique identifier that other plugins can reference when adding extensions. It needs to start with `plugins/<your-plugin-id>/` followed by a relevent path for your plugin.

The next thing you need to do is to call `getPluginExtensions` with the defined `pluginExtensionId` and Grafana will return all extensions added for that placement.

```typescript
const placement = 'plugins/myorg-extensionpoint-app/actions';
const context: AppExtensionContext = {};

const { extensions } = getPluginExtensions({
  placement,
  context,
});
```

---
