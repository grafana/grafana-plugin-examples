import { e2e } from '@grafana/e2e';

const panel = 'Datalinks';

describe('editing a panel with time series data', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'fTh-POZ4k',
    });
  });

  it('should have datalinks available in the panel', () => {
    e2e.components.Panels.Panel.containerByTitle(panel)
      .should('be.visible')
      .find('.panel-content')
      .should('be.visible')
      .get('svg')
      .find('circle')
      .first()
      .click({ force: true });

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
