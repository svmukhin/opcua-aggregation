import m from 'mithril';
import { UaClientConfig } from '../models/config/ua-client-config.model';
import { UaClientChannelConfig } from '../models/config/ua-client-channel-config.model';

export interface IClientConfigService {
  getClientConfigs(): Promise<UaClientConfig[]>;
  getClientConfig(id: number): Promise<UaClientConfig>;
  getClientChannels(clientId: number): Promise<UaClientChannelConfig[]>;
  getChannel(id: number): Promise<UaClientChannelConfig>;
  createClient(client: UaClientConfig): Promise<UaClientConfig>;
  updateClient(client: UaClientConfig): Promise<UaClientConfig>;
}

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

  async createClient(client: UaClientConfig) {
    return await m.request<UaClientConfig>({
      method: 'POST',
      url: this._baseUrl + 'client',
      body: client,
      withCredentials: true,
    });
  }

  async updateClient(client: UaClientConfig) {
    return await m.request<UaClientConfig>({
      method: 'PUT',
      url: this._baseUrl + 'client/' + client.id,
      body: client,
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
