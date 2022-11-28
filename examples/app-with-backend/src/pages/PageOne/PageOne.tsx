import * as React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, useStyles2 } from '@grafana/ui';
import { testIds } from '../../components/testIds';

export const PageOne = () => {
  const s = useStyles2(getStyles);
  
  return (
    <div data-testid={testIds.pageOne.container}>
      <div className={s.marginTop}>
        <Button onClick={grafanaHealthCheck}>Grafana Health Check</Button>
      </div>
      <div className={s.marginTop}>
        <Button onClick={pluginHealthCheck}>Plugin Health Check</Button>
      </div>
      <div className={s.marginTop}>
        <Button onClick={backendPing}>Ping Backend</Button>
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
});

async function grafanaHealthCheck() {
  console.log("checking grafana health");
  const health = await Promise.resolve(getBackendSrv().get("api/health"));
  console.log(health.database);
};

async function pluginHealthCheck() {
  console.log("checking plugin health");
  const health = await Promise.resolve(getBackendSrv().get("api/plugins/app-with-backend/health"));
  console.log(health.message);
};

// /api/plugins/app-with-backend/resources/ping
async function backendPing() {
  console.log("pinging backend");
  const ping = await Promise.resolve(getBackendSrv().get("api/plugins/app-with-backend/resources/ping"));
  console.log(ping.message);
};
