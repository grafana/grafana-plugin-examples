import { VizLegendOptions } from '@grafana/schema';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  legend: VizLegendOptions;
}
