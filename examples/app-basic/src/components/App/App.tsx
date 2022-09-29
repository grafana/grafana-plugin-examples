import * as React from 'react';
import { AppRootProps } from '@grafana/data';
import { useFallbackPluginNavigation } from '@grafana/migrations/9.2';
import { Routes } from '../Routes';

export const App = ({ onNavChanged, meta }: AppRootProps) => {
  useFallbackPluginNavigation(onNavChanged, meta);

  return <Routes />;
};
