import { e2e } from '@grafana/e2e';

import { ROUTES } from '../../src/constants';
import { testIds } from '../../src/components/testIds';
import pluginJson from '../../src/plugin.json';

const { pageHome, pageWithDrilldown, pageWithTabs } = e2e.getSelectors(testIds);
const headerTitle = 'Basic App Plugin';

describe('navigating app', () => {
  it('should render the home page successfully', () => {
    cy.visit(`http://localhost:3000/a/${pluginJson.id}/${ROUTES.Home}`);
    pageHome.container().should('be.visible');
    cy.get('h1').contains('Home page').should('be.visible');
  });

  it('should render the page with tabs successfully', () => {
    cy.visit(`http://localhost:3000/a/${pluginJson.id}/${ROUTES.WithTabs}`);
    pageWithTabs.container().should('be.visible');
    cy.get('h1').contains('Page with tabs').should('be.visible');
  });

  it('should render the page with drilldown successfully', () => {
    cy.visit(`http://localhost:3000/a/${pluginJson.id}/${ROUTES.WithDrilldown}`);
    pageWithDrilldown.container().should('be.visible');
    cy.get('h1').contains('Page with drilldown').should('be.visible');
  });
});
