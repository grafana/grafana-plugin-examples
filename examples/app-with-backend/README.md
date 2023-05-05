# Grafana App with Backend Plugin Template

This template is a starting point for building an app plugin for Grafana. It includes a backend component.

## What are Grafana app plugins?

App plugins can let you create a custom out-of-the-box monitoring experience by custom pages, nested datasources and panel plugins.

A backend allows it to perform a variety of additional tasks, like handling incoming HTTP requests.

This plugin demonstrates how to use `CallResource`, which can be used to run custom logic and return a HTTP JSON response to Grafana. This response can then be consumed on the frontend.

## Guides in this example

| **Example**                                                           | **Source** |
| --------------------------------------------------------------------- | ---------- |
| How CallResource works                                                | TODO       |
| How to define a custom HTTP CallResource handler for a backend plugin | TODO       |
| How to define multiple HTTP routes in a CallResource handler          | TODO       |
| How to call an HTTP CallResource handler from the frontend            | TODO       |

### How CallResource works

**Example:** [app.go](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-backend/pkg/plugin/app.go#L35)

Your backend app must implement the `backend.CallResourceHandler` interface:

```go
type CallResourceHandler interface {
	CallResource(ctx context.Context, req *CallResourceRequest, sender CallResourceResponseSender) error
}
```

This can be used to return a "resource" from the backend to the frontend.

`CallResource` is often used to implement an HTTP-like server in a backend plugin, which can be easily called and consumed from the frontend.

The Grafana Plugins SDK for Go provides an adapter to make `CallResource` act like an HTTP server. More details below.

### How to define a custom HTTP CallResource handler for a backend plugin

**Example:** [app.go](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-backend/pkg/plugin/app.go#L35)

The Grafana Plugins SDK for Go provides `httpadapter.New` to adapt an `http.Handler` to a `backend.CallResourceHandler`.

```go
type App struct {
   backend.CallResourceHandler
}

func NewApp(_ backend.AppInstanceSettings) (instancemgmt.Instance, error) {
   var app App

   // ...
   app.CallResourceHandler = httpadapter.New(stdHttpHandler)
   // ...

   return app, nil
}
```

### How to define multiple HTTP routes in a CallResource handler

**Example:** [app.go](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-backend/pkg/plugin/app.go#L34), [resources.go](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-backend/pkg/plugin/resources.go)

A plugin can only have one `backend.CallResourceHandler` implementation (one handler). If your app needs more than one handler (e.g.: `/a`, `/b`, `/c`), you need to use a mux (also known as "router") instead.

`http.ServeMux` from the Go standard library implements `http.Handler`, and it's accepted by `httpadapter.New`.

Combined with the mux, this allows you to easily define multiple HTTP handlers as functions:

```go
func handleSomething(w http.ResponseWriter, req *http.Request) {
   // handle the request
}

func handleSomethingElse(w http.ResponseWriter, req *http.Request) {
   // handle the request
}

func NewApp(_ backend.AppInstanceSettings) (instancemgmt.Instance, error) {
   var app App

   // ...
   mux := http.NewServeMux()

   mux.HandleFunc("/something", handleSomething)
   mux.HandleFunc("/something_else", handleSomethingElse)

   app.CallResourceHandler = httpadapter.New(mux)
   // ...

   return app, nil
}

```

### How to call an HTTP CallResource handler from the frontend

**Example:** [PageOne.tsx](https://github.com/grafana/grafana-plugin-examples/blob/main/examples/app-with-backend/src/pages/PageOne/PageOne.tsx#L12)

The routes are available under `api/plugins/PLUGIN_ID/resources/ROUTE`.

Those can be retrieved through `getBackendSrv().get()`, `getBackendSrv().post()`, etc.

```typescript
const { error, loading, value } = useAsync(() => {
  const backendSrv = getBackendSrv();

  return Promise.all([
    backendSrv.get(`api/plugins/myorg-withbackend-app/resources/something`),
    backendSrv.get(
      `api/plugins/myorg-withbackend-app/resources/something_else`
    ),
  ]);
});

// Loading, error handling, etc...

// If the handler returns a JSON response, it's possible to get it like so:
const [something, somethingElse] = value;
const jsonMessage = something?.message;

return (
  <HorizontalGroup>
    <h3>Ping Backend</h3> <span>{jsonMessage}</span>
  </HorizontalGroup>
);
```

## Learn more

TODO
