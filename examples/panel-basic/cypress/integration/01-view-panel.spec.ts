import { e2e } from '@grafana/e2e';

describe('panel with time series data', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({ uid: 'O4tc_E6Gz' });
  });

  it('should display a good looking graph', () => {
    const panel = 'Basic Panel';
    const screenshot = 'time-series-graph';

    e2e.components.Panels.Panel.containerByTitle(panel)
      .should('be.visible')
      .find('.panel-content')
      .scrollIntoView()
      .screenshot(screenshot);

    //@ts-ignore
    e2e().compareScreenshots(screenshot);
  });
});
