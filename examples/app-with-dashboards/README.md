# Grafana App with Dashboards Template

This template showcases how to bundle dashboards into an app plugin.

## Guides in this example

| **Example**                                                             | **Source**                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [How to bundle a dashboard](#how-to-bundle-a-dashboard)                 | [plugin.json], [example-dashboard1.json], [example-dashboard2.json] |
| [How to access a bundled dashboard](#how-to-access-a-bundled-dashboard) | [App.tsx]                                                           |

### How to bundle a dashboard

**Examples**: [plugin.json], [example-dashboard1.json], [example-dashboard2.json]

To bundle a dashboard in an app plugin:

1. Place the dashboard's JSON file inside `src/dashboards`.
2. Define it in `plugin.json` inside `includes` as `"type": "dashboard"`:

```json
"includes": [
    {
      "type": "dashboard",
      "name": "Example dashboard 1",
      "path": "dashboards/example-dashboard1.json",
      "role": "Admin",
      "addToNav": true,
      "uid": "Av57mRHVz"
    },
    {
      "type": "dashboard",
      "name": "Example dashboard 2",
      "path": "dashboards/example-dashboard2.json",
      "role": "Admin",
      "addToNav": true,
      "uid": "ND1Bfw3VcNGg"
    }
  ],
```

### How to access a bundled dashboard

**Examples**: [App.tsx]

Bundled dashboards can be accessed by their ID.

This plugin example includes two links in `App.tsx`, which will redirect the browser to the bundled dashboards when clicked:

**example-dashboard1.json**

```json
{
  // ...
  "uid": "Av57mRHVz" // <--
  // ...
}
```

**plugin.json**

```json
{
  "type": "dashboard",
  "name": "Example dashboard 1",
  "path": "dashboards/example-dashboard1.json",
  "role": "Admin",
  "addToNav": true,
  "uid": "Av57mRHVz" // <--
},
```

**App.tsx**

```html
<a href="/d/Av57mRHVz"> Example dashboard 1 </a>
```

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Basic app plugin example](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/app-basic#readme)

<!-- prettier-ignore-start -->
[plugin.json]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-dashboards/src/plugin.json
[example-dashboard1.json]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-dashboards/src/dashboards/example-dashboard1.json
[example-dashboard2.json]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-dashboards/src/dashboards/example-dashboard2.json
[App.tsx]: https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-dashboards/src/components/App/App.tsx#L15-L17
<!-- prettier-ignore-end -->
