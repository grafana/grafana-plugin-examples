import { e2e } from '@grafana/e2e';

e2e.scenario({
  describeName: 'Smoke test',
  itName: 'Smoke test',
  scenario: () => {
    e2e.flows.openDashboard({ uid: 'O4tc_E6Gz' });

    e2e.components.Panels.Panel.title('Basic Panel').should('be.visible');
  },
});
