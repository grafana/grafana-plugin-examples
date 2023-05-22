import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';
import pluginJson from '../../src/plugin.json';

const { pageOne, pageFour, pageTwo, pageThree } = e2e.getSelectors(testIds);
const headerTitle = 'Basic App Plugin';

describe('navigating app', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:3000/a/${pluginJson.id}/one`);    
  });

  it('should render page one successfully', () => {
    // wait for page to successfully render
    pageOne.container().should('be.visible');
    cy.get('h1').contains(headerTitle).should('be.visible');
  });

  it('should render full width example successfully', () => {
    // wait for page to successfully render
    pageOne.container().should('be.visible');
    cy.get('h1').contains(headerTitle).should('be.visible');
    
    // navigating to page four with full width layout
    pageOne.navigateToFour().click();
    cy.get('body').find('h1').should('not.exist');

    // navigate back to page one
    pageFour.navigateBack().click();
    cy.get('h1').contains(headerTitle).should('be.visible');
  });

  it('should open page two in tab successfully', () => {
    // wait for page to successfully render
    pageOne.container().should('be.visible');
    cy.get('h1').contains(headerTitle).should('be.visible');
    
    // navigating to page two which is opened in a tab
    e2e.components.Tab.title('Page Two').click();
    pageTwo.container().should('be.visible');
  });

  it('should open page three in tab successfully', () => {
    // wait for page to successfully render
    pageOne.container().should('be.visible');
    cy.get('h1').contains(headerTitle).should('be.visible');
    
    // navigating to page two which is opened in a tab
    e2e.components.Tab.title('Page Three').click();
    pageThree.container().should('be.visible');
  });
});
