# Grafana app with RBAC

This App plugin example shows you how to leverage Grafana role base access control to control accesses to your routes with your own set of roles and permissions.

![screenshot](./src/img/showcase.png)

## How to use

Requires Grafana version 9.4.0 or later. Currently, this is behind the `accessControlOnCall` feature toggle.

### Define roles

### Protect includes

### Protect routes

### Assign the role

Assigning roles to specific users requires an [enterprise license](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/access-control/#role-based-access-control-rbac).
If you have one you can edit the docker-compose file as follow:

```yaml
environment:
  - GF_ENTERPRISE_LICENSE_TEXT=<your license>
```
