# Grafana app plugin with OAuth2 integration

This plugin is an example of how to integrate OAuth2 authentication into a Grafana plugin.

**Note:** This plugin requires Grafana 10.1 or later

## How to use

This app allows you to do requests to the Grafana API as the plugin or on behalf of a user (by specifying the user ID). The plugin will then use the access token to do requests to the Grafana API.

![screenshot](./src/img/screenshot-showcase.png)

## Grafana configuration

This is an experimental feature, the `externalServiceAuth` feature toggle must be enabled. 

Additionally, Grafana needs `auth.extended_jwt` to be enabled and configured. Set your audience and issuer to your base URL. Example:

```ini
[auth.extended_jwt]
enabled = true
expect_audience = http://localhost:3000/
expect_issuer = http://localhost:3000/
```

## Authentication flow

The plugin uses the [JWT Bearer Assertion OAuth2 Extension](https://datatracker.ietf.org/doc/html/rfc7523) to authenticate users and obtain an access token that can be used to authorize requests against the Grafana API. To enable it, add the section below to your `plugin.json` file.

```json
  "externalServiceRegistration": {
    "permissions": [{ "action": "dashboards:create", "scope": "folders:uid:general" }],
    "impersonation": {
      "permissions": [
        { "action": "dashboards:create", "scope": "folders:*" },
        { "action": "dashboards:read", "scope": "dashboards:*" },
        { "action": "dashboards:read", "scope": "folders:*" },
        { "action": "folders:read", "scope": "folders:*" }
      ]
    }
  }
```

The `permissions` section defines the set of permissions granted to the plugin. The `impersonation` section defines the set of permissions that are granted to the impersonated user when the plugin makes requests on behalf of a user. Note that for this to work, the user must have permissions as well to perform those actions. See the Grafana documentation about [access control](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/access-control/) for more information.

## Service registration and token retrieval

Once a plugin is registered with an `externalServiceRegistration` section, Grafana will automatically create a service account for it. After that, to use it, there is a function exposed by the Grafana SDK that can be used to retrieve the access token for the service account. This function relies on environment variables that are set with the necessary credentials:

```go
	app.tokenRetriever, err = oauthtokenretriever.New()
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

```go
    // User impersonation token
    token, err = a.tokenRetriever.OnBehalfOfUser(ctx, userID)
    ...
    req.Header.Set("Authorization", "Bearer "+token)
```

Check the [app.go](./pkg/plugin/app.go) and [resources.go](./pkg/plugin/resources.go) files for more details about how it's done for this plugin.

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Basic app plugin example](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/app-basic#readme)
- [Plugin.json documentation](https://grafana.com/developers/plugin-tools/reference-plugin-json)
- [How to sign a plugin?](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin)
