import React, { useState, useEffect, useMemo } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';
import { useStyles2, InteractiveTable, Column, CellProps } from '@grafana/ui';

interface Paper {
  title: string;
  authors: string[];
}

export function ResearchDocs() {
  const s = useStyles2(getStyles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [papers, setPapers] = useState<Paper[]>([]);

  const columns = useMemo<Array<Column<Paper>>>(
    () => [
      {
        id: 'title',
        header: 'Patent title',
      },
      {
        id: 'authors',
        header: 'Authors',
        cell: ({ cell: { value } }: CellProps<string[]>) => value.join(', '),
      },
    ],
    []
  );

  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/plugins/grafana-appwithrbac-app/resources/papers', { method: 'GET' });

        if (!response.ok) {
          throw new Error('Request failed. Status ' + response.statusText);
        }

        const json = await response.json();
        setPapers(json);
      } catch (err: any) {
        setError(err.message || 'Something went wrong with the request.');
      }
      setIsLoading(false);
    };
    fetchPapers();
  }, []);

  let content = <></>;

  if (isLoading) {
    content = <div> The page is loading... </div>;
  }

  if (error) {
    content = <div> An error happened while fetching the research papers: {error} </div>;
  }

  if (!isLoading && !error) {
    content = <InteractiveTable columns={columns} data={papers} getRowId={(row: Paper) => row.title} />;
  }

  return (
    <PluginPage>
      <div data-testid={testIds.researchDocs.container}>
        <div className={s.large}>
          &#x1F512; Normally accessible to <span className={s.blue}>anyone</span> (requires{' '}
          <span className={s.blue}>grafana-appwithrbac-app.papers:read</span>).
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
  blue: css({
    color: '#6e9fff',
  }),
});
