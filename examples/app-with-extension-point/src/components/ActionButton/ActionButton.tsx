import { isPluginExtensionCommand, isPluginExtensionLink, PluginExtension } from '@grafana/data';
import { Button, ButtonGroup, ContextMenu, Menu } from '@grafana/ui';
import { testIds } from 'components/testIds';
import React, { ReactElement, ReactNode, useEffect, useRef, useState } from 'react';

type Props = {
  extensions: PluginExtension[];
};

export function ActionButton(props: Props): ReactElement {
  const { extensions } = props;
  const [isOpen, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const { current } = buttonRef;

    if (!current) {
      return;
    }

    setPosition({
      x: current.offsetLeft,
      y: current.offsetTop + 25,
    });
  }, []);

  if (extensions.length === 0) {
    return <Button>Run default action</Button>;
  }

  return (
    <>
      <ButtonGroup>
        <Button>Run default action</Button>
        <Button data-testid={testIds.actions.button} ref={buttonRef} icon="angle-down" onClick={() => setOpen(true)} />
      </ButtonGroup>
      {isOpen && (
        <ContextMenu
          focusOnOpen={false}
          renderMenuItems={renderExtensionMenu(extensions)}
          x={position.x}
          y={position.y}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function renderExtensionMenu(extensions: PluginExtension[]): () => ReactNode {
  return function renderMenuItems() {
    return (
      <div data-testid={testIds.actions.menu}>
        {extensions.map((extension) => {
          if (isPluginExtensionCommand(extension)) {
            return <Menu.Item key={extension.key} label={extension.title} onClick={extension.callHandlerWithContext} />;
          }

          if (isPluginExtensionLink(extension)) {
            return <Menu.Item key={extension.key} label={extension.title} url={extension.path} />;
          }

          return null;
        })}
      </div>
    );
  };
}
