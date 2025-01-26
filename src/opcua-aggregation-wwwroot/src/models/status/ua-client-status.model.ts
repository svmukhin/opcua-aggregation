import { MonitoredItem } from './monitored-item.model';

export type UaClientStatus = {
  id: string;
  serverUri: string;
  sessionName: string;
  connectError: number;
  monitoredItems: MonitoredItem[];
};
