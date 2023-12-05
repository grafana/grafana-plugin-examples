# Grafana App with Backend plugin

This template is a starting point for building an app plugin for Grafana. It includes a backend component.

## What are Grafana app plugins?

App plugins can let you create a custom out-of-the-box monitoring experience by including custom pages, nested data sources, and panel plugins. A backend allows it to perform a variety of additional tasks, like handling incoming HTTP requests.

## Get started

### Frontend

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev

   # or

   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes
   yarn test
   
   # Exists after running all the tests
   yarn lint:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   yarn server
   ```

6. Run the E2E tests (using Cypress)

   ```bash
   # Spin up a Grafana instance first that we tests against 
   yarn server
   
   # Start the tests
   yarn e2e
   ```

7. Run the linter

   ```bash
   yarn lint
   
   # or

   yarn lint:fix
   ```

### Backend

1. Update [Grafana plugin SDK for Go](https://grafana.com/developers/plugin-tools/introduction/grafana-plugin-sdk-for-go) dependency to the latest minor version:

   ```bash
   go get -u github.com/grafana/grafana-plugin-sdk-go
   go mod tidy
   ```

2. Build backend plugin binaries for Linux, Windows and Darwin:

   ```bash
   mage -v
   ```

3. List all available Mage targets for additional commands:

   ```bash
   mage -l
   ```

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [All plugin examples](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/)
- [Plugin.json documentation](https://grafana.com/developers/plugin-tools/reference-plugin-json)
- [Sign a plugin](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin)
