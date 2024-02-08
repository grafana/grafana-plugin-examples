import * as React from 'react';
import { css } from '@emotion/css';
import { useParams, Link } from 'react-router-dom';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { testIds } from '../../components/testIds';

export const PageThree = () => {
  const s = useStyles2(getStyles);
  const { id } = useParams<{ id: string }>();

  return (
    <div data-testid={testIds.pageThree.container}>
      This is page three.
      <br />
      <br />
      {/* The ID parameter is set */}
      {id && (
        <>
          <strong>ID:</strong> {id}
        </>
      )}
      {/* No ID parameter */}
      {!id && (
        <>
          <strong>No id parameter is set in the URL.</strong> <br />
          Try the following link: <br />
          <Link className={s.link} to={prefixRoute(`${ROUTES.Three}/123456789`)}>
            {prefixRoute(`${ROUTES.Three}/123456789`)}
          </Link>
        </>
      )}
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  link: css`
    color: ${theme.colors.text.link};
    text-decoration: underline;
  `,
});
