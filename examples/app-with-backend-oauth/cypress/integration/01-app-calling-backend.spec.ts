import { e2e } from "@grafana/e2e";
import { testIds } from "../../src/components/testIds";
import pluginJson from "../../src/plugin.json";

const { pageOne } = e2e.getSelectors(testIds);

describe("visiting app page one", () => {
  beforeEach(() => {
    cy.visit(`http://localhost:3000/a/${pluginJson.id}/one`);
  });

  it("should successfully call backend", () => {
    // wait for page to successfully render
    pageOne.container().should("be.visible");
    
    // wait for backend call to be successful
    pageOne.ping().should("be.visible").contains("pong");
  });

  it("should successfully check health", () => {
    // wait for page to successfully render
    pageOne.container().should("be.visible");

    // wait for health check to be successful
    pageOne.health().should("be.visible").contains("OK");
  });
});
