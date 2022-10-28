# Basic App Plugin With Dashboards

This example demonstrates how to build a basic app plugin with dashboards for Grafana that uses custom routing.

## What are Grafana app plugins?

App plugins can let you create a custom out-of-the-box monitoring experience by custom pages, nested datasources and panel plugins.

Please check out the `app-basic` [README file](../app-basic/README.md) for general App development guidelines. This example is very similar to the basic one with the only difference of adding dashboards.

---

### How to provide a dashboard alongside of the plugin

You can define dashboards that you want to add under the `includes` section of your [plugin.json].

Example payload:

```javascript
// plugin.json
{
   "includes": [
      {
         "type": "dashboard",
         // The text of the menu item
         "name": "Example dashboard 1",
         // The path to the dashboard file
         "path": "dashboards/example-dashboard1.json",
         // The role who can access this page
         "role": "Admin",
         // This tells Grafana to add this page to the left sidebar
         "addToNav": true         
      }
   ]
}
```

#### Common pitfalls:
- Make sure there is no `id` field set on the top level of the `json` file
- Make sure the `uid` field is there, is unique and is matching your plugin.json
- `shared for export` versions of dashboards are not supported  (the one that have inputs). Use the [JSON model variant](https://grafana.com/docs/grafana/latest/dashboards/json-model/). 