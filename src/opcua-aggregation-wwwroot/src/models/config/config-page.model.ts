import { IClientConfigService } from '../../services/client-config.service';
import { UaClientConfig } from './ua-client-config.model';

export interface IConfigPageModel {
  list: UaClientConfig[] | undefined;
  load(): Promise<void>;
}

export class ConfigPageModel implements IConfigPageModel {
  list: UaClientConfig[] | undefined;

  constructor(private _service: IClientConfigService) {}

  async load() {
    this.list = await this._service.getClientConfigs();
  }
}
