import { IClientStatusService } from '../../services/client-status.service';
import { UaClientStatus } from './ua-client-status.model';

export interface IStatusPageModel {
  current: UaClientStatus | undefined;
  list: UaClientStatus[] | undefined;
  init(): Promise<void>;
  load(id: number): Promise<void>;
}

export class StatusPageModel implements IStatusPageModel {
  current: UaClientStatus | undefined;
  list: UaClientStatus[] | undefined;

  constructor(private _service: IClientStatusService) {}

  async init() {
    this.list = await this._service.getClientStatuses();
  }

  async load(id: number) {
    this.current = await this._service.getClientStatus(id);
  }
}
