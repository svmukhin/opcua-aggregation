import { IClientStatusService } from '../../services/client-status.service';
import { container } from '../../utils/di-container';
import { UaClientStatus } from './ua-client-status.model';

export class StatusPageModel {
  private _service: IClientStatusService;
  list: UaClientStatus[] | undefined;

  constructor() {
    this._service = container.resolve<IClientStatusService>(
      'IClientStatusService'
    );
  }

  async load() {
    this.list = await this._service?.getClientStatuses();
  }
}
