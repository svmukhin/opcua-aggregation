import { ClientStatusService } from '../services/client-status.service';
import { MonitoredItem } from './monitored-item.model';

export type UaClientStatus = {
  id: string;
  serverUri: string;
  sessionName: string;
  connectError: number;
  monitoredItems: MonitoredItem[];
};

export class StatusPageModel {
  current: UaClientStatus | undefined;
  list: UaClientStatus[] | undefined;

  constructor(private _service: ClientStatusService) {}

  async init() {
    this.list = await this._service.getClientStatuses();
  }

  async load(id: number) {
    this.current = await this._service.getClientStatus(id);
  }
}
