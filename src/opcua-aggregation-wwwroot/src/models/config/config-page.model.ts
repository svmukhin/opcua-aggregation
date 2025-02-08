import { IClientConfigService } from '../../services/client-config.service';
import { container } from '../../utils/di-container';
import { UaClientConfig } from './ua-client-config.model';

export class ConfigPageModel {
  private _service: IClientConfigService;
  list: UaClientConfig[] | undefined;

  constructor() {
    this._service = container.resolve<IClientConfigService>(
      'IClientConfigService'
    );
  }

  async load() {
    this.list = await this._service?.getClientConfigs();
  }
}
