import { PluginExtension, PluginExtensionLink, SelectableValue } from '@grafana/data';
import { isPluginExtensionLink } from '@grafana/runtime';
import { Button, ButtonGroup, ButtonSelect, ToolbarButton } from '@grafana/ui';
import { GoToLinkModal } from 'components/GoToLinkModal';
import { testIds } from 'components/testIds';

import React, { ReactElement, useMemo, useState } from 'react';

type Props = {
  extensions: PluginExtension[];
};

export function ActionButton(props: Props): ReactElement {
  const options = useExtensionsAsOptions(props.extensions);
  const [extension, setExtension] = useState<PluginExtensionLink | undefined>();

  if (options.length === 0) {
    return <Button>Run default action</Button>;
  }

  return (
    <>
      <ButtonGroup>
        <ToolbarButton key="default-action" variant="canvas" onClick={() => alert('You triggered the default action')}>
          Run default action
        </ToolbarButton>
        <ButtonSelect
          data-testid={testIds.actions.button}
          key="select-extension"
          variant="canvas"
          options={options}
          onChange={(option) => {
            const extension = option.value;

            if (isPluginExtensionLink(extension)) {
              if (extension.path) {
                return setExtension(extension);
              }
              if (extension.onClick) {
                return extension.onClick();
              }
            }
          }}
        />
      </ButtonGroup>
      {extension && extension?.path && (
        <GoToLinkModal title={extension.title} path={extension.path} onDismiss={() => setExtension(undefined)} />
      )}
    </>
  );
}

function useExtensionsAsOptions(extensions: PluginExtension[]): Array<SelectableValue<PluginExtension>> {
  return useMemo(() => {
    return extensions.reduce((options: Array<SelectableValue<PluginExtension>>, extension) => {
      if (isPluginExtensionLink(extension)) {
        options.push({
          label: extension.title,
          title: extension.title,
          value: extension,
        });
      }
      return options;
    }, []);
  }, [extensions]);
}
