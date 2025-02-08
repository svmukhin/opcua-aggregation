import { IClientStatusService } from '../../services/client-status.service';
import { container } from '../../utils/di-container';
import { UaClientStatus } from './ua-client-status.model';

export class StatusDetailsPageModel {
  private _service: IClientStatusService;
  current: UaClientStatus | undefined;

  constructor() {
    this._service = container.resolve<IClientStatusService>(
      'IClientStatusService'
    );
  }

  async load(id: number) {
    this.current = await this._service.getClientStatus(id);
  }
}
