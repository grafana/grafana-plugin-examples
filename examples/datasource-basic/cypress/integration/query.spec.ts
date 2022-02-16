import { e2e } from '@grafana/e2e';

describe('querying datasource', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'lYi_st-7z',
      queryParams: {
        from: new Date('2022-02-01 10:00:00').getTime(),
        to: new Date('2022-02-01 12:00:00').getTime(),
      },
    });
  });

  describe('with query type: time series', () => {
    it('should return data with one value/time field', () => {
      const panel = 'Timeseries';
      const data = [
          { time: '2022-02-01 10:00:00', value: 25 },
          { time: '2022-02-01 10:12:00', value: 22 },
          { time: '2022-02-01 10:24:00', value: 19 },
          { time: '2022-02-01 10:36:00', value: 23 },
          { time: '2022-02-01 10:48:00', value: 22 },
          { time: '2022-02-01 11:00:00', value: 22 },
          { time: '2022-02-01 11:12:00', value: 18 },
          { time: '2022-02-01 11:24:00', value: 26 },
          { time: '2022-02-01 11:36:00', value: 24 },
          { time: '2022-02-01 11:48:00', value: 20 },
    ];

      e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Inspect, panel);
      e2e.components.PanelInspector.Data.content()
        .should('be.visible')
        .within(() => {
          for (let index = 0; index < data.length; index++) {
            const expected = data[index];
            const time = index * 2;
            const value = time + 1;

            cy.get('div[role=cell]').eq(time).contains(expected.time);
            cy.get('div[role=cell]').eq(value).contains(expected.value);
          }
        });
    });
  });

  describe('with query type: table', () => {});
  describe('with macro: $__timeFilter()', () => {});
  describe('with macro: $__timeFilter(column)', () => {});
  describe('with template variable: $table', () => {});
});