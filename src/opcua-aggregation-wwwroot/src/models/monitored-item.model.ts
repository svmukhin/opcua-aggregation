export interface MonitoredItem {
  tagId: string;
  aggregationTag: {
    value: number;
    statusCode: number;
    timestamp: string;
  };
}
