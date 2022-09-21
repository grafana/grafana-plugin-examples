import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';
import pluginJson from '../../src/plugin.json';

const { appConfig } = e2e.getSelectors(testIds);

describe('configurating app', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:3000/plugins/${pluginJson.id}`);    
  });

  it('should be successfully configured', () => {
    // wait for page to successfully render
    appConfig.container().should('be.visible');

    // resetting the secret configured field.
    appConfig.container().find('button').contains('Reset').click();

    // enter some configuration values
    appConfig.apiKey().type('secret-api-key');
    appConfig.apiUrl().type('http://www.my-awsome-grafana-app.com/api');
    appConfig.submit().click();

    // make sure it got updated successfully
    e2e.flows.assertSuccessNotification();
  });
});
