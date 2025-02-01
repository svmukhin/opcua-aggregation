import { IClientStatusService } from '../../services/client-status.service';
import { UaClientStatus } from './ua-client-status.model';

export interface IStatusDetailsPageModel {
  current: UaClientStatus | undefined;
  load(id: number): Promise<void>;
}

export class StatusDetailsPageModel implements IStatusDetailsPageModel {
  current: UaClientStatus | undefined;

  constructor(private _service: IClientStatusService) {}

  async load(id: number) {
    this.current = await this._service.getClientStatus(id);
  }
}
