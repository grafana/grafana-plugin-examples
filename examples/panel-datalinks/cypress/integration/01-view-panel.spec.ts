import { e2e } from '@grafana/e2e';

const panel = 'Datalinks';

describe('viewing a panel with datalinks', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'fTh-POZ4k',
    });
  });

  it('should display an svg', () => {
    e2e.components.Panels.Panel.containerByTitle(panel)
      .should('be.visible')
      .find('.panel-content')
      .get('svg')
      .should('be.visible');
  });

  it('should render a datalinks dropdown menu when clicking circles', () => {
    e2e.components.Panels.Panel.containerByTitle(panel)
      .should('be.visible')
      .find('.panel-content')
      .get('svg')
      .find('circle')
      .first()
      .click({ force: true });

    cy.get('#grafana-portal-container')
      .find('[role="menu"] label')
      .should('be.visible')
      .parent()
      .find('a[href="https://www.google.com"]')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer');
  });
});
