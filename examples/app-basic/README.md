# Grafana Basic App plugin example

The Grafana Basic App plugin sample demonstrates how to build a basic app plugin for Grafana with custom routing.

## What are Grafana app plugins?

App plugins let you create a custom out-of-the-box monitoring experience with features such as custom pages, nested data sources, and panel plugins.

## Guides in this example

| **Example**                                                                                     | **Source**                   |
| ----------------------------------------------------------------------------------------------- | ---------------------------- |
| [Add a custom route](#add-a-custom-route)                                                       | [App.tsx], [constants.ts#L6] |
| [Add a custom route with URL parameters](#add-a-custom-route-with-url-parameters)               | [App.tsx], [PageThree.tsx]   |
| [Create a full-width page with no navigation bar](#create-a-full-width-page)                    | [PageThree.tsx]              |
| [Add custom styling to your components](#add-custom-styling-to-your-components)                 | [PageThree.tsx#L10]          |
| [Use the Grafana theme in your components](#use-the-grafana-theme-in-your-components)           | [PageThree.tsx#L26]          |
| [How to add menu items to the left sidebar](#add-menu-items-to-the-left-sidebar)                | [plugin.json]                |
| [Add a configuration page to your app](#add-a-configuration-page-to-your-app)                   | [module.ts], [AppConfig.tsx] |
| [Add custom configuration values to your app](#add-custom-configuration-values-to-your-app)     | [AppConfig.tsx]              |
| [Add configuration options for setting secrets](#add-configuration-options-for-setting-secrets) | [AppConfig.tsx]              |
| [Update the plugin settings using the API](#update-the-plugin-settings-using-the-api)           | [AppConfig.tsx]              |

### Add a custom route

Grafana (and the app plugins are no exception) uses [React Router](https://reactrouter.com/). You can register a new route based on our examples by adding a new route constant in [constants.ts#L6] and then use it in the [App.tsx].

**Example:** [App.tsx], [constants.ts#L6]

---

### Add a custom route with URL parameters

You can use URL parameters for any routes by appending them to the path in the `<Route>` component.

**Example:** [App.tsx], [PageThree.tsx]

```javascript
// URL parameters are identified by the colon syntax (":<parameter>")
// The "?" at the end marks the parameter as optional, in which case React Router also identifies this route if there are no parameters used.
<Route path={`${ROUTES.Three}/:id?`} element={<PageThree />} />
```

**Retrieve URL parameters:**

```javascript
import { useParams } from 'react-router-dom';

export const MyComponent = () => {
   const { id } = useParams<{ id: string }>();
};
```

---

### Create a full-width page

You can hide the left sidebar and get access to the full width of the page by changing the layout of the `<PluginPage>` component.

**Example:** [PageThree.tsx]

![Full-width page example](./screenshots/screenshot-full-width-page.png)

```typescript
import { PageLayoutType } from '@grafana/data';

// ...

export function YourPage() {
  return (
    <PluginPage layout={PageLayoutType.Canvas}>

    // ...
```

---

### Add custom styling to your components

We recommend using [Emotion](https://emotion.sh) to style your components as in the example above.

**Example:** [PageThree.tsx#L10]

[More info on how to use @emotion/css](https://emotion.sh/docs/@emotion/css)

---

### Use the Grafana theme in your components

The easiest way is to use the [`useStyles2()`](https://github.com/grafana/grafana/blob/main/contribute/style-guides/themes.md#usestyles2-hook) hook to access the `GrafanaTheme2` theme object.

**Example:** [PageThree.tsx#L26]

[Documentation on the Grafana Theme](https://github.com/grafana/grafana/blob/main/contribute/style-guides/themes.md)

---

### Add menu items to the left sidebar

You can define pages that you want to add to the left sidebar menu under the `includes` section of your [plugin.json].

**Example:** [plugin.json]

![Grafana left sidebar](screenshots/screenshot-left-sidebar.png)

**Structure of a page item:**

```javascript
// plugin.json
{
   "includes": [
      {
         "type": "page",
         // The text of the menu item
         "name": "Page One",
         // The link of the menu item (%PLUGIN_ID% will resolve the id of your plugin at build time)
         "path": "/a/%PLUGIN_ID%",
         // The role who can access this page
         "role": "Admin",
         // This tells Grafana to add this page to the left sidebar
         "addToNav": true,
         "defaultNav": true
      }
   ]
}
```

---

### Add a configuration page to your app

You can add a configuration page to your app to set custom configuration options that are going to be persisted for your plugin on the backend.

Configuration pages can also be used to save secrets that are no longer sent down to the client but which can be appended to your proxy requests by the backend.

**Example:** [module.ts], [AppConfig.tsx]

---

### Add custom configuration values to your app

Add a new form field under your [AppConfig.tsx] and make sure that you are setting it under the `jsonData` object.

The `jsonData` object is an arbitrary object of data that can be persisted for your plugin using the `/api/plugins/${pluginId}/settings` API endpoint.

**Example:** [AppConfig.tsx]

---

### Add configuration options for setting secrets

Secrets for plugins are stored in the `secureJsonData` object. This is an arbitrary object of data; however, its value will never be sent back to the frontend for security reasons.

**Example:** [AppConfig.tsx]

---

### Update the plugin settings using the API

You can update plugin settings by sending a `POST` request to the `/api/plugins/${pluginId}/settings` API endpoint.

**Example:** [AppConfig.tsx]

Example payload:

```javascript
{
   enabled: true,
   pinned: true,
   // Arbitrary object of data for your plugin
   jsonData: {
      apiUrl: state.apiUrl,
      isApiKeySet: true,
   },
   // Arbitrary object of data for plugin secrets
   // (pass `undefined` if you don't want to override existing values)
   secureJsonData: {
      apiKey: state.apiKey,
   }
}
```

---

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Grafana Synthetic Monitoring App](https://github.com/grafana/synthetic-monitoring-app)
- [Plugin.json documentation](https://grafana.com/developers/plugin-tools/reference-plugin-json)
- [Sign a plugin](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin)

<!-- prettier-ignore-start -->
[App.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/components/App/App.tsx#L14
[PageThree.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/pages/PageThree.tsx
[PageThree.tsx#L10]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/pages/PageThree.tsx#L10
[PageThree.tsx#L26]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/pages/PageThree.tsx#L26
[plugin.json]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/plugin.json
[module.ts]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/module.ts#L5
[AppConfig.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/components/AppConfig/AppConfig.tsx#L25
[constants.ts#L6]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-basic/src/constants.ts#L6
<!-- prettier-ignore-end -->
