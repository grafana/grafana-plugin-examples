import { e2e } from '@grafana/e2e';
import { ariaLabels } from '../../src/components/ariaLabels';
import { testIds } from '../../src/components/testIds';

const selectors = e2e.getSelectors(ariaLabels);
const { panel } = e2e.getSelectors(testIds);

const title = 'Basic Panel';

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
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, title);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.gradientScheme().should('be.checked');
        selectors.gradientHue().check({ force: true }).should('be.checked');
      });

    e2e.components.PanelEditor.applyButton().click();
    panel.container().should('be.visible');
  });

  /**
   * skip until https://github.com/grafana/grafana/issues/59073 is resolved
   */
  it.skip('should be able to change graph opacity', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, title);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.fillOpacity().click().focused().clear().type('100');
      });

    e2e.components.PanelEditor.applyButton().click();

    panel.container().should('be.visible');
  });

  it('should be able to hide legend', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, title);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.legendDisplayHidden().check({ force: true }).should('be.checked');
      });

    e2e.components.PanelEditor.applyButton().click();

    panel.container().should('be.visible');
  });

  it('should be able to place legend to the right', () => {
    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, title);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        selectors.legendPlacementRight().check({ force: true }).should('be.checked');
      });

    e2e.components.PanelEditor.applyButton().click();

    panel.container().should('be.visible');
  });
});
