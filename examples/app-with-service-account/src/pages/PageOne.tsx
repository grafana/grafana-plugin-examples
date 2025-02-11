import * as React from 'react';
import { useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';
import { testIds } from '../components/testIds';
import { useAsync } from 'react-use';
import { Badge, Button, Stack, Input, JSONFormatter, Label, Select, useStyles2, TextArea } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

export function PageOne() {
  const s = useStyles2(getStyles);

  const backendSrv = getBackendSrv();
  const { error, loading, value } = useAsync(() => {
    return Promise.all([backendSrv.get(`api/plugins/grafana-appwithserviceaccount-app/health`)]);
  });
  const [apiPath, setApiPath] = useState('/search');
  const [apiResponse, setApiResponse] = useState({});
  const [apiToken, setApiToken] = useState('');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');

  if (loading) {
    return (
      <div data-testid={testIds.pageOne.container}>
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !value) {
    return (
      <div data-testid={testIds.pageOne.container}>
        <span>Error: {error?.message}</span>
      </div>
    );
  }

  const [health] = value;
  const apiRequest = () => {
    setApiResponse('Loading...');
    let params = {};
    params = { ...params, method: method };
    if (method === 'POST' || method === 'PUT') {
      let parsedBody = JSON.parse(body);
      params = { ...params, body: JSON.stringify(parsedBody) };
    }
    backendSrv
      .get(`api/plugins/grafana-appwithserviceaccount-app/resources/api${apiPath}`, params)
      .then((response) => {
        setApiResponse(response.results);
        setApiToken(response.token);
      })
      .catch((error) => {
        setApiResponse({ error: error });
      });
  };

  return (
    <div data-testid={testIds.pageOne.container} className={s.container}>
      <Stack direction="column">
        <Stack>
          <h3>Plugin Health Check</h3> <span data-testid={testIds.pageOne.health}>{renderHealth(health?.message)}</span>
        </Stack>
        <h3>API request:</h3>
        <div className={s.input}>
          <Stack>
            <Select
              value={method}
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
              ]}
              onChange={(e) => setMethod(e.value ? e.value : 'POST')}
            />
            <Label>Endpoint</Label>
            <Input value={apiPath} onChange={(e) => setApiPath(e.currentTarget.value)} />
            <div className={s.inputbutton}>
              <Button onClick={apiRequest}>Request</Button>
            </div>
          </Stack>
        </div>
        {(method === 'POST' || method === 'PUT') && (
          <TextArea className={s.body} value={body} onChange={(e) => setBody(e.currentTarget.value)} type="text" />
        )}
        <h3>Token used</h3>
        <p>{apiToken}</p>
        <h3>API Response</h3>
        <div data-testid="json-format-response">
          <JSONFormatter json={apiResponse} />
        </div>
      </Stack>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    padding: ${theme.spacing(4)};
  `,
  inputbutton: css`
    margin-left: ${theme.spacing(1)};
  `,
  input: css`
    display: flex;
    justify-content: space-between;
    width: 100%;
  `,
  body: css`
    width: 100%;
    height: 400px;
  `,
  section: css`
    margin-top: ${theme.spacing(4)};
    margin-right: ${theme.spacing(4)};
  `,
});

function renderHealth(message: string | undefined) {
  switch (message) {
    case 'ok':
      return <Badge color="green" text="OK" icon="heart" />;

    default:
      return <Badge color="red" text="BAD" icon="bug" />;
  }
}
