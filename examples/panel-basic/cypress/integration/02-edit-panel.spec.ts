import { e2e } from '@grafana/e2e';
import { ariaLabels } from '../../src/components/ariaLabels';

const selectors = e2e.getSelectors(ariaLabels);
const panel = 'Basic Panel';

describe('editing a panel with time series data', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'O4tc_E6Gz',
      queryParams: {
        from: 1643313600000,
        to: 1643670000000,
      },
    });
  });

  it('should be able to change graph gradient', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.gradientScheme().should('be.checked');
        selectors.gradientHue().check({ force: true }).should('be.checked');
      });

    e2e.components.PanelEditor.applyButton().click();

    e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  });

  it('should be able to change graph opacity', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.fillOpacity().click().focused().clear().type('100');
      });

    e2e.components.PanelEditor.applyButton().click();

    e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  });

  it('should be able to hide legend', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.legendDisplayHidden().check({ force: true }).should('be.checked');
      });

    e2e.components.PanelEditor.applyButton().click();

    e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  });

  it('should be able to place legend to the right', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.legendPlacementRight().check({ force: true }).should('be.checked');
      });

    e2e.components.PanelEditor.applyButton().click();

    e2e.components.Panels.Panel.containerByTitle(panel).should('be.visible').find('.panel-content');
  });
});
