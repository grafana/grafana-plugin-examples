import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';

const { panel } = e2e.getSelectors(testIds);
const title = 'Basic Panel';

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
    e2e.components.Panels.Panel.title(title).should('be.visible');
    panel.container().should('be.visible');
  });
});
