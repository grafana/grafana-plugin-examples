# Grafana app with RBAC

This App plugin example shows you how to leverage Grafana role base access control to control accesses to your routes with your own set of roles and permissions.

![screenshot](./src/img/showcase.png)

## How to use

Requires Grafana version 10.4.0 or later. Currently, this is behind the `accessControlOnCall` feature toggle.

### Define roles

To define roles, you just need to add a `roles` section to the `plugin.json` file. Here is an example:

```json
"roles": [
  {
    "role": {
      "name": "Patents Reader",
      "description": "Read patents",
      "permissions": [
        {"action": "grafana-appwithrbac-app.patents:read"}
      ]
    },
    "grants": ["Admin"]
  },
  {
    "role": {
      "name": "Research papers Reader",
      "description": "Read research papers",
      "permissions": [
        {"action": "grafana-appwithrbac-app.papers:read"}
      ]
    },
    "grants": ["Viewer"]
  }
]
```

### Protect includes

To protect you frontend pages behind an action check, add `action` to the include definitions of your `plugin.json` file:

```json
"includes": [
  {
    "type": "page",
    "name": "Research documents",
    "path": "/a/%PLUGIN_ID%/research-docs",
    "action": "grafana-appwithrbac-app.papers:read",
    "addToNav": true,
    "defaultNav": false
  },
  {
    "type": "page",
    "name": "Patents",
    "path": "/a/%PLUGIN_ID%/patents",
    "action": "grafana-appwithrbac-app.patents:read",
    "addToNav": true,
    "defaultNav": false
  }
]
```

### Protect routes

This is not demonstrated in this plugin but if you want to protect your proxied routes behind an action check, add `reqAction` to the route definitions of your `plugin.json` file:

```json
"routes": [
  {
    "path": "api/external/patents",
    "method": "*",
    "reqAction": "grafana-appwithrbac-app.patents:read",
    "url": "{{ .JsonData.backendUrl }}/api/external/patents",
    "headers": [
      {
        "name": "Authorization",
        "content": "{{ .SecureJsonData.backendApiToken }}"
      }
    ]
  }
]
```

### Protect plugin backend resources

If your backend is exposing resources, you can also protect them behind an action check.

You'll need to activate two additional features:

- `externalServiceAccounts` to be able to query Grafana's users permissions.
- `idForwarding` to be able to identify the user/service account.

In your `plugin.json`, add the `iam` section to get a service account token with the needed permissions:

```json
"iam": {
  "permissions": [
    {"action": "users.permissions:read", "scope": "users:*"}
  ]
}
```

You'll need to import our authlib/authz library:

```go
import "github.com/grafana/authlib/authz"
```

Then instantiate a client:

```go
// Get Grafana URL
grafanaURL := os.Getenv("GF_APP_URL")
if grafanaURL == "" {
  return nil, fmt.Errorf("GF_APP_URL is required")
}

// Get the service account token to query Grafana
saToken := os.Getenv("GF_PLUGIN_APP_CLIENT_SECRET")
if saToken == "" {
  return nil, fmt.Errorf("GF_PLUGIN_APP_CLIENT_SECRET is required")
}

// Initialize the authorization client
client, err := authz.NewEnforcementClient(authz.Config{
  APIURL: grafanaURL,
  Token:      saToken,
  // Grafana is signing the JWTs on local setups
  JWKsURL:    strings.TrimRight(grafanaURL, "/") + "/api/signing-keys/keys",
}, 
	// Fetch all the user permission prefixed with grafana-appwithrbac-app
	authz.WithSearchByPrefix("grafana-appwithrbac-app"),
	// Use a cache with a lower expiry time
	authz.WithCache(cache.NewLocalCache(cache.Config{
		Expiry:          10 * time.Second,
		CleanupInterval: 5 * time.Second,
	})),
)
if err != nil {
  return nil, err
}
```

> Note that the `WithSearchByPrefix` option is specified here to avoid querying the authorization server every time we want to check a different action.
> The `WithCache` option allows you to override the library's internal cache with you own or with different settings. The default expiry time is 5 minutes.

Enforcing access control can then be done with the client as follow:

```go
func (a *App) HasAccess(req *http.Request, action string) (bool, error) {
	// Retrieve the id token
	idToken := req.Header.Get("X-Grafana-Id")
	if idToken == "" {
		return false, errors.New("id token not found")
	}
  
	// Check user access
	hasAccess, err := a.authzClient.HasAccess(req.Context(), idToken, action)
	if err != nil || !hasAccess {
		return false, err
	}
	return true, nil
}
```

```go
if hasAccess, err := a.HasAccess(req, "grafana-appwithrbac-app.patents:read"); err != nil || !hasAccess {
  if err != nil {
    log.DefaultLogger.FromContext(req.Context()).Error("Error checking access", "error", err)
  }
  http.Error(w, "permission denied", http.StatusForbidden)
  return
}
```

### Assign the role

Assigning roles to specific users requires an [enterprise license](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/access-control/#role-based-access-control-rbac).
If you have one you can edit the docker-compose file as follow:

```yaml
environment:
  - GF_ENTERPRISE_LICENSE_TEXT=<your license>
```
