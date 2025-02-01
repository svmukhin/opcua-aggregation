import { IClientStatusService } from '../../services/client-status.service';
import { UaClientStatus } from './ua-client-status.model';

export interface IStatusPageModel {
  list: UaClientStatus[] | undefined;
  load(): Promise<void>;
}

export class StatusPageModel implements IStatusPageModel {
  list: UaClientStatus[] | undefined;

  constructor(private _service: IClientStatusService) {}

  async load() {
    this.list = await this._service.getClientStatuses();
  }
}
