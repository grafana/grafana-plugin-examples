import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { BasicDataSourceOptions, BasicSecureJsonData } from '../../types';

export type EditorProps = DataSourcePluginOptionsEditorProps<BasicDataSourceOptions, BasicSecureJsonData>;
