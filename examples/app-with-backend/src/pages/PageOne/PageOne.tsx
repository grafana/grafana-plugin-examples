import * as React from 'react';
import { getBackendSrv, PluginPage } from '@grafana/runtime';
import { testIds } from '../../components/testIds';
import { useAsync } from 'react-use';
import { Badge, Stack } from '@grafana/ui';
import { usePageNav } from 'utils/utils.routing';

export const PageOne = () => {
  const pageNav = usePageNav();
  const { error, loading, value } = useAsync(() => {
    const backendSrv = getBackendSrv();

    return Promise.all([
      backendSrv.get(`api/plugins/myorg-withbackend-app/resources/ping`),
      backendSrv.get(`api/plugins/myorg-withbackend-app/health`),
    ]);
  });

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

  const [ping, health] = value;

  return (
    <PluginPage pageNav={pageNav}>
      <div data-testid={testIds.pageOne.container}>
        <Stack>
          <h3>Plugin Health Check</h3> <span data-testid={testIds.pageOne.health}>{renderHealth(health?.message)}</span>
        </Stack>
        <Stack>
          <h3>Ping Backend</h3> <span data-testid={testIds.pageOne.ping}>{ping?.message}</span>
        </Stack>
      </div>
    </PluginPage>
  );
};

function renderHealth(message: string | undefined) {
  switch (message) {
    case 'ok':
      return <Badge color="green" text="OK" icon="heart" />;

    default:
      return <Badge color="red" text="BAD" icon="bug" />;
  }
}
