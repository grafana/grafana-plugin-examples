import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';
import pluginJson from '../../src/plugin.json';

const { homePage } = e2e.getSelectors(testIds);
const headerTitle = 'Hello and welcome to our demo app!';

describe('navigating app', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:3000/a/${pluginJson.id}/`);
  });

  it('should render home page successfully', () => {
    // wait for page to successfully render
    homePage.container().should('be.visible');
    cy.get('h1').contains(headerTitle).should('be.visible');
  });

  it('should navigate to the first dashboard', () => {
    // wait for page to successfully render
    homePage.dashboard1().click();
  });

  it('should navigate to the second dashboard', () => {
    // wait for page to successfully render
    homePage.dashboard2().click();
  });
});
