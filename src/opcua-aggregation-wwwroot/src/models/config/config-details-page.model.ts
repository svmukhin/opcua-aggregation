import { IClientConfigService } from '../../services/client-config.service';
import { container } from '../../utils/di-container';
import { UaClientConfig } from './ua-client-config.model';

export class ConfigDetailsPageModel {
  private _service: IClientConfigService;
  current: UaClientConfig | undefined;

  constructor() {
    this._service = container.resolve<IClientConfigService>(
      'IClientConfigService'
    );
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
