# Grafana App Plugin that exposes a plugin extension placement

This example demonstrates how to add a plugin extension placement to your plugin that can be extended by other plugins.

- [What are UI plugin extensions?](#what-are-grafana-app-plugins)
- [Guides in this example](#guides-in-this-example)
- [Learn more](#learn-more)

## Guides in this example

| **Example**                                                                    | **Source**                             |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| [How to enable the tab navigation bar?](#how-to-enable-the-tab-navigation-bar) | [utils.routing.ts], [constants.ts#L17] |

### How to enable the tab navigation bar?

**Example:** [utils.routing.ts], [constants.ts#L17]

![Navigation Bar](screenshots/screenshot-nav-bar.png)

You can enable the tab navigation bar for your app plugin by passing a "nav-model" the `onNavChanged()` function that is passed in as a prop to your root App component.
If you don't want to get too much into the details you can just edit `NAVIGATION` object in [constants.ts#L17].

**Setting the tabs in [constants.ts#L17]**

```javascript
// Add navigation items here that you want to appear in the tabs
export const NAVIGATION: Record<string, NavItem> = {
  [ROUTES.One]: {
    id: ROUTES.One,
    text: 'Page One',
    icon: 'database',
    url: `${PLUGIN_BASE_URL}/one`,
  },
  // ...
};
```

---
