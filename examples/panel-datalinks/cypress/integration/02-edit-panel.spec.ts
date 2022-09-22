import { e2e } from '@grafana/e2e';
import { ariaLabels } from '../../src/components/ariaLabels';

const selectors = e2e.getSelectors(ariaLabels);
const panel = 'Datalinks';

describe('editing a panel with time series data', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'fTh-POZ4k',
    });
  });

  it('should be able to add datalinks to the panel', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);

    e2e.components.OptionsGroup.group('Data links')
      .scrollIntoView()
      .within(() => {
        selectors.dataLinksEditor().find('button').contains('Add link').click();
      });

    cy.get('div[data-overlay-container="true"]').within(() => {
      cy.get('input[placeholder="Show details"]').type('Visit Bing');
      cy.get('div[data-slate-editor="true"]').focus().type('h').wait(1000).type('http://www.bing.com');
      cy.get('button').contains('Save').click();
    });

    e2e.components.PanelEditor.applyButton().click();

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
      .find('a')
      .should('have.length', 3);
  });

  // it('should be able to change graph gradient', () => {
  //   e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
  // e2e.components.PanelEditor.OptionsPane.content()
  //   .should('be.visible')
  //   .within(() => {
  //     selectors.gradientScheme().should('be.checked');
  //     selectors.gradientHue().check({ force: true }).should('be.checked');
  //   });

  //   e2e.components.PanelEditor.applyButton().click();

  //   e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  // });

  // it('should be able to change graph opacity', () => {
  //   e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
  //   e2e.components.PanelEditor.OptionsPane.content()
  //     .should('be.visible')
  //     .within(() => {
  //       selectors.fillOpacity().click().focused().clear().type('100');
  //     });

  //   e2e.components.PanelEditor.applyButton().click();

  //   e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  // });

  // it('should be able to hide legend', () => {
  //   e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
  //   e2e.components.PanelEditor.OptionsPane.content()
  //     .should('be.visible')
  //     .within(() => {
  //       selectors.legendDisplayHidden().check({ force: true }).should('be.checked');
  //     });

  //   e2e.components.PanelEditor.applyButton().click();

  //   e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  // });

  // it('should be able to place legend to the right', () => {
  //   e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
  //   e2e.components.PanelEditor.OptionsPane.content()
  //     .should('be.visible')
  //     .within(() => {
  //       selectors.legendPlacementRight().check({ force: true }).should('be.checked');
  //     });

  //   e2e.components.PanelEditor.applyButton().click();

  //   e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  // });
});
