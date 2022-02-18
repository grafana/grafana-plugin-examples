import { e2e } from '@grafana/e2e';
import { testIds } from '../../src/components/testIds';

const { configEditor } = e2e.getSelectors(testIds);

describe('configurating datasource', () => {
  it('should be possible to update api key and default time field', () => {
    e2e.flows.addDataSource({
      type: 'Basic Datasource',
      form: () => {
        configEditor.timeField().type('created');
        configEditor.apiKey().type('super-secret-api-key');
      },
    });

    configEditor.timeField().should('have.value', 'created');
    configEditor.apiKey().should('have.value', 'configured');
  });

  it('should be possible to reset the api key', () => {
    e2e.flows.addDataSource({
      type: 'Basic Datasource',
      form: () => {
        configEditor.timeField().type('created');
        configEditor.apiKey().type('super-secret-api-key');
      },
    });

    configEditor.apiKey().siblings('button').click();
    configEditor.apiKey().should('have.value', '');
  });
});
