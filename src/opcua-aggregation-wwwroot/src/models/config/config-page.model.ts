import { ClientConfigService } from '../../services/client-config.service';
import { UaClientConfig } from './ua-client-config.model';

export class ConfigPageModel {
  current: UaClientConfig | undefined;
  list: UaClientConfig[] | undefined;

  constructor(private _service: ClientConfigService) {}

  async init() {
    this.list = await this._service.getClientConfigs();
  }

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
