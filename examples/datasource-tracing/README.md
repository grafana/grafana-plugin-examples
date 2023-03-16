# Grafana tracing example

This example showcases how to use tracing in backend plugins.

This allows you to create spans from your plugins, which will be propagated to Grafana's tracing endpoint 
(if it's enabled in Grafana).

The trace ID is propagated from Grafana to your plugins, so your spans will show in the main request's trace.

Only OpenTelemetry is supported.

## Developer usage

TODO: Explain how to create the tracer and spans and httpclient middleware

## User usage

TODO: Explain how to configure Grafana for tracing to be passed around to plugins

