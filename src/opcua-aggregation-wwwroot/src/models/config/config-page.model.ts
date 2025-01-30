import { IClientConfigService } from '../../services/client-config.service';
import { UaClientConfig } from './ua-client-config.model';

export interface IConfigPageModel {
  current: UaClientConfig | undefined;
  list: UaClientConfig[] | undefined;
  init(): Promise<void>;
  load(id: number): Promise<void>;
  loadChannels(): Promise<void>;
}

export class ConfigPageModel implements IConfigPageModel {
  current: UaClientConfig | undefined;
  list: UaClientConfig[] | undefined;

  constructor(private _service: IClientConfigService) {}

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
