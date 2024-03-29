import React from 'react';
import { css } from '@emotion/css';
import { useParams, Link } from 'react-router-dom';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { prefixRoute } from '../utils/utils.routing';
import { ROUTES } from '../constants';
import { PluginPage } from '@grafana/runtime';

export function PageTwo() {
  const s = useStyles2(getStyles);
  const { id } = useParams<{ id: string }>();

  return (
    <PluginPage>
      <div>
        This is page two.
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
            <Link className={s.link} to={prefixRoute(`${ROUTES.Two}/123456789`)}>
              {prefixRoute(`${ROUTES.Three}/123456789`)}
            </Link>
          </>
        )}
      </div>
    </PluginPage>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  link: css`
    color: ${theme.colors.text.link};
    text-decoration: underline;
  `,
});
