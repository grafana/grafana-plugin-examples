import { test, expect } from '@grafana/plugin-e2e';

// This test suite is for the QueryEditor component
// This test will be skipped because the plugin-e2e doesn't
// have support for testing a stream.
// refreshPanel won't work as it only work on http
