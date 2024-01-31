import React, { useState, useEffect, useMemo } from 'react';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';
import { InteractiveTable, Column, CellProps } from '@grafana/ui';

interface Paper {
  title: string;
  authors: string[];
}

export function ResearchDocs() {
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
        header: 'authors',
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
    content = <div> The page is loading </div>;
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
        This is the research papers page, normally allowed to viewers.
      </div>
      {content}
    </PluginPage>
  );
}
