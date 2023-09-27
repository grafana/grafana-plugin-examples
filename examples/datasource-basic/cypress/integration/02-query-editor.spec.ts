import { e2e } from '@grafana/e2e';

describe('querying datasource', () => {
  const baseUrl = 'http://localhost:3000/d/lYi_st-7z/basic-datasource-example';
  const from = new Date('2022-02-01 10:00:00Z').getTime();
  const to = new Date('2022-02-01 12:00:00Z').getTime();
  const variable = 'temperature_metrics';

  describe('in timeseries panel', () => {
    const panelId = 4;

    beforeEach(() => {
      cy.intercept('POST', '/api/ds/query*').as('query');
      cy.visit(`${baseUrl}?viewPanel=${panelId}&from=${from}&to=${to}&var-table=${variable}`);
    });

    it('should return data with one value/time field', () => {
      const expectedData = [
        { time: new Date('2022-02-01 10:00:00Z').getTime(), value: 25 },
        { time: new Date('2022-02-01 10:12:00Z').getTime(), value: 22 },
        { time: new Date('2022-02-01 10:24:00Z').getTime(), value: 19 },
        { time: new Date('2022-02-01 10:36:00Z').getTime(), value: 23 },
        { time: new Date('2022-02-01 10:48:00Z').getTime(), value: 22 },
        { time: new Date('2022-02-01 11:00:00Z').getTime(), value: 22 },
        { time: new Date('2022-02-01 11:12:00Z').getTime(), value: 18 },
        { time: new Date('2022-02-01 11:24:00Z').getTime(), value: 26 },
        { time: new Date('2022-02-01 11:36:00Z').getTime(), value: 24 },
        { time: new Date('2022-02-01 11:48:00Z').getTime(), value: 20 },
      ];

      cy.wait('@query', { timeout: 50000 }).then((interception) => {
        const data = getDataFromResponse(interception);

        for (let i = 0; i < expectedData.length; i++) {
          const expected = expectedData[i];
          const time = data.values[0][i];
          const value = data.values[1][i];

          expect(time).to.equal(expected.time);
          expect(value).to.equal(expected.value);
        }
      });
    });

    describe('with macro: $__timeFilter(column)', () => {
      it('should use specified time column in query', () => {
        const executedQuery =
          'SELECT * FROM temperature_metrics WHERE created >= datetime(2022-02-01T10:00:00Z) and created <= datetime(2022-02-01T12:00:00Z)';
        const rawQuery = 'SELECT * FROM temperature_metrics WHERE $__timeFilter(created)';

        cy.wait('@query').then((interception) => {
          getRawQueryFromRequest(interception).should('eq', rawQuery);
          getExecutedQueryFromResponse(interception).should('eq', executedQuery);
        });
      });
    });
  });

  describe('in table panel', () => {
    const panelId = 5;
    const panel = 'Table';

    beforeEach(() => {
      cy.intercept('POST', '/api/ds/query*').as('query');
      cy.visit(`${baseUrl}?viewPanel=${panelId}&from=${from}&to=${to}&var-table=${variable}`);
    });

    it('should return data with time and two value fields', () => {
      const expectedData = [
        { time: new Date('2022-02-01 10:00:00Z').getTime(), inside: 25, outside: 10 },
        { time: new Date('2022-02-01 10:12:00Z').getTime(), inside: 22, outside: 8 },
        { time: new Date('2022-02-01 10:24:00Z').getTime(), inside: 19, outside: 12 },
        { time: new Date('2022-02-01 10:36:00Z').getTime(), inside: 23, outside: 9 },
        { time: new Date('2022-02-01 10:48:00Z').getTime(), inside: 22, outside: 10 },
        { time: new Date('2022-02-01 11:00:00Z').getTime(), inside: 22, outside: 11 },
        { time: new Date('2022-02-01 11:12:00Z').getTime(), inside: 18, outside: 10 },
        { time: new Date('2022-02-01 11:24:00Z').getTime(), inside: 26, outside: 9 },
        { time: new Date('2022-02-01 11:36:00Z').getTime(), inside: 24, outside: 10 },
        { time: new Date('2022-02-01 11:48:00Z').getTime(), inside: 20, outside: 9 },
      ];

      cy.wait('@query', { timeout: 50000 }).then((interception) => {
        const data = getDataFromResponse(interception);

        for (let i = 0; i < expectedData.length; i++) {
          const expected = expectedData[i];
          const time = data.values[0][i];
          const outside = data.values[1][i];
          const inside = data.values[2][i];

          expect(time).to.equal(expected.time);
          expect(outside).to.equal(expected.outside);
          expect(inside).to.equal(expected.inside);
        }
      });
    });

    describe('with macro: $__timeFilter()', () => {
      it('should use default time column in query', () => {
        const executedQuery =
          'SELECT * FROM temperature_metrics WHERE time >= datetime(2022-02-01T10:00:00Z) and time <= datetime(2022-02-01T12:00:00Z)';
        const rawQuery = 'SELECT * FROM temperature_metrics WHERE $__timeFilter()';

        cy.wait('@query').then((interception) => {
          getRawQueryFromRequest(interception).should('eq', rawQuery);
          getExecutedQueryFromResponse(interception).should('eq', executedQuery);
        });
      });
    });

    describe('with template variable: $table', () => {
      it('should apply variable value from query', () => {
        // Check that datasource apply macro properly
        const initialRawQuery = 'SELECT * FROM temperature_metrics WHERE $__timeFilter()';
        const initialExecutedQuery =
          'SELECT * FROM temperature_metrics WHERE time >= datetime(2022-02-01T10:00:00Z) and time <= datetime(2022-02-01T12:00:00Z)';

        cy.wait('@query').then((interception) => {
          getRawQueryFromRequest(interception).should('eq', initialRawQuery);
          getExecutedQueryFromResponse(interception).should('eq', initialExecutedQuery);
        });

        // Changing template variable via query to 'battery_metrics'
        cy.visit(`${baseUrl}?viewPanel=${panelId}&from=${from}&to=${to}&var-table=battery_metrics`);

        // Check that datasource apply macro properly after variable change
        const updatedRawQuery = 'SELECT * FROM battery_metrics WHERE $__timeFilter()';
        const updatedExecutedQuery =
          'SELECT * FROM battery_metrics WHERE time >= datetime(2022-02-01T10:00:00Z) and time <= datetime(2022-02-01T12:00:00Z)';

        cy.wait('@query').then((interception) => {
          getRawQueryFromRequest(interception).should('eq', updatedRawQuery);
          getExecutedQueryFromResponse(interception).should('eq', updatedExecutedQuery);
        });
      });
    });
  });
});

function getExecutedQueryFromResponse(interception: any) {
  return cy.wrap(interception.response.body.results.A.frames[0].schema.meta.executedQueryString);
}

function getRawQueryFromRequest(interception: any) {
  return cy.wrap(interception.request.body.queries[0].rawQuery);
}

function getDataFromResponse(interception: any) {
  return interception.response.body.results.A.frames[0].data;
}
