import * as React from 'react';
import { css, cx } from '@emotion/css';
import { Link } from 'react-router-dom';
import { GrafanaTheme2 } from '@grafana/data';
import { LinkButton, Button, useStyles2 } from '@grafana/ui';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { testIds } from '../../components/testIds';

export const PageOne = () => {
  const s = useStyles2(getStyles);

  return (
    <div data-testid={testIds.pageOne.container}>
      This is page one.
      <div className={s.marginTop}>
        {/* Uses the <LinkButton> component from @grafana/ui (uses <a> elements under the hood) */}
        <LinkButton data-testid={testIds.pageOne.navigateToFour} href={prefixRoute(ROUTES.Four)}>
          Link (using &lt;LinkButton&gt;)
        </LinkButton>

        {/* Uses the <Link> component from React Router v6 (relative paths) */}
        <Link to={`../${ROUTES.Four}`} className={cx(s.marginLeft, s.link)}>
          <Button>Link (using &lt;Link&gt;)</Button>
        </Link>
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
  marginLeft: css`
    margin-left: ${theme.spacing(2)};
  `,
  link: css`
    color: ${theme.colors.text.link};
  `,
});
