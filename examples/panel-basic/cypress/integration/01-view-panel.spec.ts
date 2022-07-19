import { e2e } from '@grafana/e2e';

describe('viewing a panel with time series data', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'O4tc_E6Gz',
      queryParams: {
        from: 1643313600000,
        to: 1643670000000,
      },
    });
  });

  it('should display a good looking graph', () => {
    const panel = 'Basic Panel';

    e2e.components.Panels.Panel.containerByTitle(panel)
      .should('be.visible')
      .find('.panel-content')
      .find('[data-testid="basic-panel-example"]')
      .should('be.visible');
  });
});
