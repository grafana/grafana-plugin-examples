# Grafana app plugin with Service Account integration

This plugin is an example of how to integrate Service Account authentication into a Grafana plugin.

**Note:** This plugin requires Grafana 10.2 or later and the `externalServiceAccounts` feature toggle must be enabled. This is an experimental feature.

## How to use

This app allows you to create a service account in Grafana tailored to your plugin needs. Grafana will provide the plugin with a service account token that you can use to request the Grafana API.

![screenshot](./src/img/screenshot-showcase.png)

## Authentication flow

The plugin uses a [Grafana service account token](https://grafana.com/docs/grafana/latest/administration/service-accounts/#service-account-tokens) to authenticate against the Grafana API. To enable it, add the `externalServiceRegistration` section to your `plugin.json` file.

Here is an example to allow the plugin to create dashboards, list/update all dashboards and folders, list users, teams, team members:
```json
  "externalServiceRegistration": {
    "permissions": [
      { "action": "dashboards:create", "scope": "folders:uid:*" },
      { "action": "dashboards:read", "scope": "folders:uid:*"},
      { "action": "dashboards:write", "scope": "folders:uid:*"},
      { "action": "folders:read", "scope": "folders:uid:*"},
      { "action": "folders:write", "scope": "folders:uid:*"},
      { "action": "org.users:read", "scope": "users:*"},
      { "action": "teams:read", "scope": "teams:*"},
      { "action": "teams.permissions:read", "scope": "teams:*"}
	]
  }
```

The `permission` section defines the set of permissions granted to the plugin's service account.
See the Grafana documentation about [access control](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/access-control/) for more information.

## Service registration

Once a plugin is registered with an `externalServiceRegistration` section, Grafana will automatically create a service account and a token for it. Grafana will then share the service account token with the plugin, using an environment variable:

```go
	// Get the service account token that has been shared with the plugin
	saToken := os.Getenv("GF_PLUGIN_APP_CLIENT_SECRET")
	if saToken == "" {
		return nil, fmt.Errorf("GF_PLUGIN_APP_CLIENT_SECRET is required")
	}
```

The token can be used to request Grafana. Set your http client's `Headers` option to set the `Authorization` header on every outgoing request:
```go
	opts, err := settings.HTTPClientOptions(ctx)
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}

	opts.Headers = map[string]string{"Authorization": "Bearer " + app.saToken}

	// Now the client is pre-configured to use the bearer token
	cl, err := httpclient.New(opts)
	if err != nil {
		return nil, fmt.Errorf("httpclient new: %w", err)
	}
```

If for some reason you want to set the http request header on specific requests, here is how:

```go
    ...
    req.Header.Set("Authorization", "Bearer "+token)
```

Check the [app.go](./pkg/plugin/app.go) and [resources.go](./pkg/plugin/resources.go) files for more details about how it's done for this plugin.

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Basic app plugin example](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/app-basic#readme)
- [Plugin.json documentation](https://grafana.com/developers/plugin-tools/reference-plugin-json)
- [How to sign a plugin?](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin)
