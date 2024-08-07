import * as React from 'react';
import { ets } from '@bsull/augurs';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { LinkButton, useStyles2 } from '@grafana/ui';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { testIds } from '../../components/testIds';

export const PageOne = () => {
  const s = useStyles2(getStyles);

  // Create a model just to show that we can use the wasm module.
  ets(new Uint32Array([24, 24 * 7]));

  return (
    <div data-testid={testIds.pageOne.container}>
      This is page one.
      <div className={s.marginTop}>
        <LinkButton data-testid={testIds.pageOne.navigateToFour} href={prefixRoute(ROUTES.Four)}>Full-width page example</LinkButton>
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
});
