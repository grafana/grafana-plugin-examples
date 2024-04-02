import React, { useState, useEffect, useMemo } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';
import { useStyles2, InteractiveTable, Column, CellProps } from '@grafana/ui';

interface Patent {
  title: string;
  inventors: string[];
}

export function Patents() {
  const s = useStyles2(getStyles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patents, setPatents] = useState<Patent[]>([]);

  const columns = useMemo<Array<Column<Patent>>>(
    () => [
      {
        id: 'title',
        header: 'Patent title',
      },
      {
        id: 'inventors',
        header: 'Inventors',
        cell: ({ cell: { value } }: CellProps<string[]>) => value.join(', '),
      },
    ],
    []
  );

  useEffect(() => {
    const fetchPatents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/plugins/grafana-appwithrbac-app/resources/patents', { method: 'GET' });

        if (!response.ok) {
          throw new Error('Request failed. Status ' + response.statusText);
        }

        const json = await response.json();
        setPatents(json);
      } catch (err: any) {
        setError(err.message || 'Something went wrong with the request.');
      }
      setIsLoading(false);
    };
    fetchPatents();
  }, []);

  let content = <></>;

  if (isLoading) {
    content = <div> The page is loading... </div>;
  }

  if (error) {
    content = <div> An error happened while fetching the patents: {error} </div>;
  }

  if (!isLoading && !error) {
    content = <InteractiveTable columns={columns} data={patents} getRowId={(row: Patent) => row.title} />;
  }

  return (
    <PluginPage>
      <div data-testid={testIds.patents.container}>
        <div className={s.large}>
          &#x1F512; Normally restricted to <span className={s.orange}>Administrators</span> (requires{' '}
          <span className={s.orange}>grafana-appwithrbac-app.patents:read</span>).
        </div>
        {content}
      </div>
    </PluginPage>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  large: css({
    fontSize: 'large',
  }),
  orange: css({
    color: '#fbad37',
  }),
});
