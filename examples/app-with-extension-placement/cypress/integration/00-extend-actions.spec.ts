import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';
import pluginJson from '../../src/plugin.json';

const { actions, appA, appB } = e2e.getSelectors(testIds);

describe('extend the current app with more actions', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:3000/a/${pluginJson.id}`);
  });

  it('should extend the actions menu with a link to a-app plugin', () => {
    actions.button().should('be.visible').click();
    actions.menu().should('be.visible').get('a').contains('Go to A').click();

    appA.container().should('be.visible');
  });

  it('should extend the actions menu with a command triggered from b-app plugin', () => {
    actions.button().should('be.visible').click();
    actions.menu().should('be.visible').get('button').contains('Open from B').click();

    appB.modal().should('be.visible');
  });
});
