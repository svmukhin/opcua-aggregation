import { IClientConfigService } from '../../services/client-config.service';
import { UaClientConfig } from './ua-client-config.model';

export interface IConfigDetailsPageModel {
  current: UaClientConfig | undefined;
  load(id: number): Promise<void>;
  loadChannels(): Promise<void>;
}

export class ConfigDetailsPageModel {
  current: UaClientConfig | undefined;

  constructor(private _service: IClientConfigService) {}

  async load(id: number) {
    this.current = await this._service.getClientConfig(id);
  }

  async loadChannels() {
    if (!this.current) return;

    this.current.channels = await this._service.getClientChannels(
      this.current.id
    );
  }
}
