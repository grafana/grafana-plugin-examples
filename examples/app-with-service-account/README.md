# Grafana app plugin with Service Account integration

This plugin is an example of how to integrate Service Account authentication into a Grafana plugin.

**Note:** This plugin requires Grafana 10.2 or later and the `externalServiceAccounts` feature toggle must be enabled. This is an experimental feature.

## How to use

This app allows you to create a service account in Grafana tailored to your plugin needs. Grafana will provide the plugin with a service account token that you can use to request the Grafana API.

![screenshot](./src/img/screenshot-showcase.png)

## Authentication flow

The plugin uses a [Grafana service account token](https://grafana.com/docs/grafana/latest/administration/service-accounts/#service-account-tokens) to authenticate against the Grafana API. To enable it, add the section below to your `plugin.json` file.

```json
  "externalServiceRegistration": {
    "authProvider": "ServiceAccounts",
    "self": {
      "permissions": [
        {
          "action": "dashboards:create",
          "scope": "folders:uid:general"
        }
      ]
    }
  }
```

The `authProvider` section indicates that you want the plugin to be able to authenticate against the Grafana API
using a service account. The `self` section defines the set of permissions granted to this service account. 

## Service registration and token retrieval

// TODO (Gamab) modify the sdk to provide this

Once a plugin is registered with an `externalServiceRegistration` section, Grafana will automatically create a service account for it. After that, to use it, there is a function exposed by the Grafana SDK that can be used to retrieve the access token for the service account. This function relies on environment variables that are set with the necessary credentials:

```go
	app.tokenRetriever, err = serviceaccounttokenretriever.New()
	if err != nil {
		return nil, err
	}
```

Once the token retriever is initialized, it can be used to get access tokens, either for the plugin or for a user impersonated by the plugin:

```go
    // Plugin token
    token, err = a.tokenRetriever.Self(ctx)
    ...
    req.Header.Set("Authorization", "Bearer "+token)
```

Check the [app.go](./pkg/plugin/app.go) and [resources.go](./pkg/plugin/resources.go) files for more details about how it's done for this plugin.

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Basic app plugin example](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/app-basic#readme)
- [Plugin.json documentation](https://grafana.com/docs/grafana/latest/developers/plugins/metadata/)
- [How to sign a plugin?](https://grafana.com/docs/grafana/latest/developers/plugins/sign-a-plugin/)
