import React from 'react';
import { lastValueFrom } from 'rxjs';
import { css } from '@emotion/css';
import { Button, useStyles2, FieldSet } from '@grafana/ui';
import { PluginConfigPageProps, AppPluginMeta, PluginMeta, GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { testIds } from '../testIds';

export type JsonData = {
  apiUrl?: string;
};

interface Props extends PluginConfigPageProps<AppPluginMeta<JsonData>> {}

export const AppConfig = ({ plugin }: Props) => {
  const s = useStyles2(getStyles);
  const { enabled, jsonData } = plugin.meta;

  return (
    <div data-testid={testIds.appConfig.container}>
      {/* ENABLE / DISABLE PLUGIN */}
      <FieldSet label="Enable / Disable">
        {!enabled && (
          <>
            <div className={s.colorWeak}>The plugin is currently not enabled.</div>
            <Button
              className={s.marginTop}
              variant="primary"
              onClick={() =>
                updatePluginAndReload(plugin.meta.id, {
                  enabled: true,
                  pinned: true,
                  jsonData,
                })
              }
            >
              Enable plugin
            </Button>
          </>
        )}

        {/* Disable the plugin */}
        {enabled && (
          <>
            <div className={s.colorWeak}>The plugin is currently enabled.</div>
            <Button
              className={s.marginTop}
              variant="destructive"
              onClick={() =>
                updatePluginAndReload(plugin.meta.id, {
                  enabled: false,
                  pinned: false,
                  jsonData,
                })
              }
            >
              Disable plugin
            </Button>
          </>
        )}
      </FieldSet>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  colorWeak: css`
    color: ${theme.colors.text.secondary};
  `,
  marginTop: css`
    margin-top: ${theme.spacing(3)};
  `,
  marginTopXl: css`
    margin-top: ${theme.spacing(6)};
  `,
});

const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta<JsonData>>) => {
  try {
    await updatePlugin(pluginId, data);

    // Reloading the page as the changes made here wouldn't be propagated to the actual plugin otherwise.
    // This is not ideal, however unfortunately currently there is no supported way for updating the plugin state.
    window.location.reload();
  } catch (e) {
    console.error('Error while updating the plugin', e);
  }
};

export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta>) => {
  const response = await getBackendSrv().fetch({
    url: `/api/plugins/${pluginId}/settings`,
    method: 'POST',
    data,
  });

  return lastValueFrom(response);
};
