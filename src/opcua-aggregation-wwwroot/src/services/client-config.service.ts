import m from 'mithril';
import { UaClientConfig } from '../models/config/ua-client-config.model';
import { UaClientChannelConfig } from '../models/config/ua-client-channel-config.model';

export class ClientConfigService {
  constructor(
    private _baseUrl = 'http://localhost:5000/api/aggregation/config/'
  ) {}

  async getClientConfigs() {
    return await m.request<UaClientConfig[]>({
      method: 'GET',
      url: this._baseUrl + 'client',
      withCredentials: true,
    });
  }

  async getClientConfig(id: number) {
    return await m.request<UaClientConfig>({
      method: 'GET',
      url: this._baseUrl + 'client/' + id,
      withCredentials: true,
    });
  }

  async getClientChannels(clientId: number) {
    return await m.request<UaClientChannelConfig[]>({
      method: 'GET',
      url: this._baseUrl + 'client/' + clientId + '/channel',
    });
  }

  async getChannel(id: number) {
    return await m.request<UaClientChannelConfig>({
      method: 'GET',
      url: this._baseUrl + 'client/channel/' + id,
    });
  }
}
