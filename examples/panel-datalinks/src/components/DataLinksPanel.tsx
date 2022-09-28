import React from 'react';
import { PanelProps, getFieldDisplayValues, LinkModel, FieldConfig } from '@grafana/data';
import { PanelOptions } from 'types';
import { css, cx } from '@emotion/css';
import { DataLinksContextMenu, useStyles2, useTheme2 } from '@grafana/ui';
import { DataLinksContextMenuApi } from '@grafana/ui/components/DataLinks/DataLinksContextMenu';

interface Props extends PanelProps<PanelOptions> {}

export const DataLinksPanel = ({ data, width, height, options, replaceVariables, fieldConfig, timeZone }: Props) => {
  const styles = useStyles2(getStyles);
  const theme = useTheme2();
  const ContextMenu = DataLinksContextMenu as React.FC<PreviousContextMenuProps>;

  const fieldDisplayValues = getFieldDisplayValues({
    fieldConfig,
    reduceOptions: options.reduceOptions,
    data: data.series,
    theme,
    replaceVariables,
    timeZone,
  });

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: width;
          height: height;
        `
      )}
    >
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 -${height / 2} ${width} ${height}`}
        data-testid="datalinks-panel-example"
      >
        <g fill={theme.colors.success.main}>
          {fieldDisplayValues.map((data, idx) => {
            const step = width / fieldDisplayValues.length;

            if (data.hasLinks && data.getLinks) {
              return (
                <ContextMenu key={idx} links={data.getLinks} config={data.field}>
                  {(api) => (
                    <circle
                      r={data.display.numeric}
                      onClick={api.openMenu}
                      transform={`translate(${idx * step + step / 2}, 0)`}
                    />
                  )}
                </ContextMenu>
              );
            }
            return <circle r={data.display.numeric} key={idx} transform={`translate(${idx * step + step / 2}, 0)`} />;
          })}
        </g>
      </svg>
    </div>
  );
};

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
  };
};

// This one is created to support versions prior to 9.1.0
type PreviousContextMenuProps = {
  children: (props: DataLinksContextMenuApi) => JSX.Element;
  links: () => LinkModel[];
  config: FieldConfig;
};
