import React from 'react';
import { PluginPageProps, PluginPage as GrafanaPluginPage, config } from '@grafana/runtime';

const PluginPageFallback = ({ children }: PluginPageProps) => <>{children}</>;

export const PluginPage = GrafanaPluginPage && config.featureToggles.topnav ? GrafanaPluginPage : PluginPageFallback;
