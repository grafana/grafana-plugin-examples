# Grafana App Plugin Template

The App Plugin Template sample demonstrates how to build a basic app plugin for Grafana with custom routing.

## What are Grafana app plugins?

App plugins let you create a custom out-of-the-box monitoring experience with features such as custom pages, nested data sources, and panel plugins.

## Guides in this example

| **Example**                                                                                                        | **Source**                             |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| [Enable the tab navigation bar](#enable-the-tab-navigation-bar)                                     | [utils.routing.ts], [constants.ts#L17] |
| [Add a custom route](#add-a-custom-route)                                                           | [Routes.tsx], [constants.ts#L6]        |
| [Add a custom route with URL parameters](#add-a-custom-route-with-url-parameters)                   | [Routes.tsx], [PageThree.tsx]          |
| [Create a full-width page with no navigation bar](#create-a-full-width-page-with-no-navigation-bar) | [utils.routing.ts#L25]                 |
| [Add custom styling to your components](#add-custom-styling-to-your-components)                     | [PageFour.tsx]                         |
| [Use the Grafana theme in your components](#use-the-grafana-theme-in-your-components)               | [PageFour.tsx#L25]                     |
| [How to add menu items to the left sidebar](#hodd-menu-items-to-the-left-sidebar)                           | [plugin.json]                          |
| [Add a configuration page to your app](#add-a-configuration-page-to-your-app)                       | [module.ts], [AppConfig.tsx]           |
| [Add custom configuration values to your app](#add-custom-configuration-values-to-your-app)         | [AppConfig.tsx]                        |
| [Add configuration options for setting secrets](#add-configuration-options-for-setting-secrets)     | [AppConfig.tsx]                        |
| [Update the plugin settings using the API](#how-to-update-the-plugin-settings-using-the-api)               | [AppConfig.tsx]                        |
| [Access the saved secrets (proxying requests)](#how-to-access-the-saved-secrets-proxying-requests)         | [plugin.json]                          |

### Enable the tab navigation bar

You can enable the tab navigation bar for your app plugin by passing a `nav-model` to the `onNavChanged()` function that is passed in as a prop to your root `App` component.
If you prefer a simpler approach, you can just edit `NAVIGATION` object in [constants.ts#L17].

**Example:** [utils.routing.ts], [constants.ts#L17]

![Navigation Bar](screenshots/screenshot-nav-bar.png)

**Set the tabs in [constants.ts#L17]**

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

### Add a custom route

Grafana (and the app plugins are no exception) uses [React Router](https://reactrouter.com/). You can register a new route based on our examples by adding a new route constant in [constants.ts#L6] and then use it in the [Routes.tsx].

**Example:** [Routes.tsx], [constants.ts#L6]

---

### Add a custom route with URL parameters

You can use URL parameters for any routes by appending them to the path in the `<Route>` component.

**Example:** [Routes.tsx], [PageThree.tsx]

```javascript
// URL parameters are identified by the colon syntax (":<parameter>")
// The "?" at the end marks the parameter as optional, in which case React Router also identifies this route if there are no parameters used.
<Route exact path={`${PLUGIN_BASE_URL}/${ROUTES.Three}/:id?`} component={PageThree} />
```

**Retrieve URL parameters:**

```javascript
import { useParams } from 'react-router-dom';

export const MyComponent = () => {
   const { id } = useParams<{ id: string }>();
};
```

---

### Create a full-width page with no navigation bar

You can hide the tab navigation bar and have access to the full view right to the Grafana sidebar by calling the `onNavChanged()` function with an `undefined` (as it is done in [utils.routing.ts#L25]).

**Example:** [utils.routing.ts#L25]

![Full-width page example](./screenshots/screenshot-full-width-page.png)

> Note: In the current example it is enough to just exclude your route from the `NAVIGATION` object ([constants.ts#L17]). Doing so automatically uses a full-width page.

---

### Add custom styling to your components

We recommend using [Emotion](https://emotion.sh) to style your components as in the example above.

**Example:** [PageFour.tsx]

[More info on how to use @emotion/css](https://emotion.sh/docs/@emotion/css)

---

### Use the Grafana theme in your components

The easiest way is to use the [`useStyles2()`](https://github.com/grafana/grafana/blob/main/contribute/style-guides/themes.md#usestyles2-hook) hook to access the `GrafanaTheme2` theme object.

**Example:** [PageFour.tsx#L25]

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
[utils.routing.ts]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/utils/utils.routing.ts#L29
[Routes.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/components/Routes/Routes.tsx#L17
[PageThree.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/pages/PageThree/PageThree.tsx#L10
[PageFour.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/pages/PageFour/PageFour.tsx#L22
[PageFour.tsx#L25]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/pages/PageFour/PageFour.tsx#L25
[utils.routing.ts#L25]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/utils/utils.routing.ts#L25
[plugin.json]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/plugin.json#L19
[module.ts]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/module.ts#L5
[AppConfig.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/components/AppConfig/AppConfig.tsx#L26
[constants.ts#L6]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/constants.ts#L6
[constants.ts#L17]: https://github.com/grafana/grafana-plugin-examples/blob/master/examples/app-basic/src/constants.ts#L17
<!-- prettier-ignore-end -->
