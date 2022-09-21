import { e2e } from '@grafana/e2e';

describe('querying datasource', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: 'lYi_st-7z',
      queryParams: {
        from: new Date('2022-02-01 10:00:00Z').getTime(),
        to: new Date('2022-02-01 12:00:00Z').getTime(),
        'var-table': 'temperature_metrics',
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
            const timeIndex = index * 2;
            const valueIndex = timeIndex + 1;

            cy.get('div[role=cell]').eq(timeIndex).contains(expected.time).should('be.visible');
            cy.get('div[role=cell]').eq(valueIndex).contains(expected.value).should('be.visible');
          }
        });
    });
  });

  describe('with query type: table', () => {
    it('should return data with time and two value fields', () => {
      const panel = 'Table';
      const data = [
        { time: '2022-02-01 10:00:00', inside: 25, outside: 10 },
        { time: '2022-02-01 10:12:00', inside: 22, outside: 8 },
        { time: '2022-02-01 10:24:00', inside: 19, outside: 12 },
        { time: '2022-02-01 10:36:00', inside: 23, outside: 9 },
        { time: '2022-02-01 10:48:00', inside: 22, outside: 10 },
        { time: '2022-02-01 11:00:00', inside: 22, outside: 11 },
        { time: '2022-02-01 11:12:00', inside: 18, outside: 10 },
        { time: '2022-02-01 11:24:00', inside: 26, outside: 9 },
        { time: '2022-02-01 11:36:00', inside: 24, outside: 10 },
        { time: '2022-02-01 11:48:00', inside: 20, outside: 9 },
      ];

      e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Inspect, panel);
      e2e.components.PanelInspector.Data.content()
        .should('be.visible')
        .within(() => {
          for (let index = 0; index < data.length; index++) {
            const expected = data[index];
            const timeIndex = index * 3;
            const outsideIndex = timeIndex + 1;
            const insideIndex = outsideIndex + 1;

            cy.get('div[role=cell]').eq(timeIndex).contains(expected.time).should('be.visible');
            cy.get('div[role=cell]').eq(outsideIndex).contains(expected.outside).should('be.visible');
            cy.get('div[role=cell]').eq(insideIndex).contains(expected.inside).should('be.visible');
          }
        });
    });
  });

  describe('with macro: $__timeFilter()', () => {
    it('should use default time column in query', () => {
      const panel = 'Table';
      const executedQuery =
        'SELECT * FROM temperature_metrics WHERE time >= datetime(2022-02-01T10:00:00Z) and time <= datetime(2022-02-01T12:00:00Z)';
      const rawQuery = 'SELECT * FROM temperature_metrics WHERE $__timeFilter()';

      e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Inspect, panel);
      e2e.components.Drawer.General.title(`Inspect: ${panel}`).within(() => {
        e2e.components.Tab.title('Query').should('be.visible').click();

        // First verify that our raw query contains the macro
        e2e.components.PanelInspector.Query.refreshButton().should('be.visible').click();
        e2e.components.PanelInspector.Query.jsonObjectKeys().contains('queries:').should('be.visible').parent().click();
        e2e.components.PanelInspector.Query.jsonObjectKeys().contains('0:').should('be.visible').parent().click();
        e2e.components.PanelInspector.Query.jsonObjectKeys()
          .contains('rawQuery:')
          .should('be.visible')
          .parent()
          .within(() => cy.get('span.json-formatter-string').contains(rawQuery).should('be.visible'));

        // Then verify that the executed query contains the replacement for the macro
        e2e.components.PanelInspector.Query.content().get('pre').contains(executedQuery).should('be.visible');
      });
    });
  });

  describe('with macro: $__timeFilter(column)', () => {
    it('should use specified time column in query', () => {
      const panel = 'Timeseries';
      const executedQuery =
        'SELECT * FROM temperature_metrics WHERE created >= datetime(2022-02-01T10:00:00Z) and created <= datetime(2022-02-01T12:00:00Z)';
      const rawQuery = 'SELECT * FROM temperature_metrics WHERE $__timeFilter(created)';

      e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Inspect, panel);
      e2e.components.Drawer.General.title(`Inspect: ${panel}`).within(() => {
        e2e.components.Tab.title('Query').should('be.visible').click();

        // First verify that our raw query contains the macro
        e2e.components.PanelInspector.Query.refreshButton().should('be.visible').click();
        e2e.components.PanelInspector.Query.jsonObjectKeys().contains('queries:').should('be.visible').parent().click();
        e2e.components.PanelInspector.Query.jsonObjectKeys().contains('0:').should('be.visible').parent().click();
        e2e.components.PanelInspector.Query.jsonObjectKeys()
          .contains('rawQuery:')
          .should('be.visible')
          .parent()
          .within(() => cy.get('span.json-formatter-string').contains(rawQuery).should('be.visible'));

        // Then verify that the executed query contains the replacement for the macro
        e2e.components.PanelInspector.Query.content().get('pre').contains(executedQuery).should('be.visible');
      });
    });
  });

  describe('with template variable: $table', () => {
    it('should apply variable value in query', () => {
      const panel = 'Table';

      // Verify that we are using the `temperature_metrics` template value.
      e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Inspect, panel);
      e2e.components.Drawer.General.title(`Inspect: ${panel}`).within(() => {
        e2e.components.Tab.title('Query').should('be.visible').click();
        e2e.components.PanelInspector.Query.content()
          .should('be.visible')
          .get('pre')
          .contains(
            'SELECT * FROM temperature_metrics WHERE time >= datetime(2022-02-01T10:00:00Z) and time <= datetime(2022-02-01T12:00:00Z)'
          )
          .should('be.visible');
      });

      // Change value of the template variable to `battery_metrics`.
      e2e.flows.openDashboard({
        uid: 'lYi_st-7z',
        queryParams: {
          from: new Date('2022-02-01 10:00:00Z').getTime(),
          to: new Date('2022-02-01 12:00:00Z').getTime(),
          'var-table': 'battery_metrics',
        },
      });

      // Verify that we are using the `battery_metrics` template value.
      e2e.flows.openPanelMenuItem(e2e.flows.PanelMenuItems.Inspect, panel);
      e2e.components.Drawer.General.title(`Inspect: ${panel}`).within(() => {
        e2e.components.Tab.title('Query').should('be.visible').click();
        e2e.components.PanelInspector.Query.content()
          .should('be.visible')
          .get('pre')
          .contains(
            'SELECT * FROM battery_metrics WHERE time >= datetime(2022-02-01T10:00:00Z) and time <= datetime(2022-02-01T12:00:00Z)'
          )
          .should('be.visible');
      });
    });
  });
});
