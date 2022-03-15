import { e2e } from '@grafana/e2e';
import { ariaLabels } from '../../src/components/ariaLabels';

const { panelEditor } = e2e.getSelectors(ariaLabels);

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
    const panel = 'Basic Panel';
    const screenshot = 'time-series-graph-hue';

    e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Edit, panel);
    e2e.components.PanelEditor.OptionsPane.content()
      .should('be.visible')
      .within(() => {
        panelEditor.gradientScheme().should('be.checked');
        panelEditor.gradientHue().check({ force: true }).should('be.checked');
      });

    e2e.components.PanelEditor.applyButton().click();

    e2e.components.Panels.Panel.containerByTitle(panel)
      .should('be.visible')
      .find('.panel-content')
      .scrollIntoView()
      .screenshot(screenshot);

    //@ts-ignore
    e2e().compareScreenshots(screenshot);
  });
});
