import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';

const panelTitle = 'Datalinks';
const { panel } = e2e.getSelectors(testIds);

describe('viewing a panel with datalinks', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'fTh-POZ4k',
    });
  });

  it('should display the datalinks visualization', () => {
    panel.svg().should('be.visible');
  });

  it('should render a datalinks dropdown menu when clicking circles', () => {
    it('should have datalinks available in the panel', () => {
      panel.svg().find('circle').first().click({ force: true });

      cy.get('#grafana-portal-container')
        .find('[role="menu"] label')
        .should('be.visible')
        .parent()
        .find('a')
        .should('have.length', 2)
        .first()
        .should('contain', 'Visit Yahoo')
        .should('have.attr', 'rel', 'noopener noreferrer')
        .should('have.attr', 'href', 'https://www.yahoo.com')
        .next()
        .should('contain', 'Visit Google')
        .should('have.attr', 'rel', 'noopener noreferrer')
        .should('have.attr', 'href', 'https://www.google.com');
    });
  });
});
