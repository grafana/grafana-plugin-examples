type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  selectedRefId: string;
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}
