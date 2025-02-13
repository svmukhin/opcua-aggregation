import m from 'mithril';
import { UaClientConfig } from '../models/config/ua-client-config.model';
import { UaClientChannelConfig } from '../models/config/ua-client-channel-config.model';

export interface IClientConfigService {
  getClients(): Promise<UaClientConfig[]>;
  getClient(id: number): Promise<UaClientConfig>;
  createClient(client: UaClientConfig): Promise<UaClientConfig>;
  updateClient(client: UaClientConfig): Promise<UaClientConfig>;
  deleteClient(id: number): Promise<UaClientConfig>;
  getChannels(clientId: number): Promise<UaClientChannelConfig[]>;
  getChannel(id: number): Promise<UaClientChannelConfig>;
  createChannel(
    clientId: number,
    channel: UaClientChannelConfig
  ): Promise<UaClientChannelConfig>;
  updateChannel(channel: UaClientChannelConfig): Promise<UaClientChannelConfig>;
  deleteChannel(id: number): Promise<UaClientChannelConfig>;
}

export class ClientConfigService {
  constructor(
    private _baseUrl = 'http://localhost:5000/api/aggregation/config/'
  ) {}

  async getClients() {
    return await m.request<UaClientConfig[]>({
      method: 'GET',
      url: this._baseUrl + 'client',
      withCredentials: true,
    });
  }

  async getClient(id: number) {
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

  async deleteClient(id: number) {
    return await m.request<UaClientConfig>({
      method: 'DELETE',
      url: this._baseUrl + 'client/' + id,
      withCredentials: true,
    });
  }

  async getChannels(clientId: number) {
    return await m.request<UaClientChannelConfig[]>({
      method: 'GET',
      url: this._baseUrl + 'client/' + clientId + '/channel',
      withCredentials: true,
    });
  }

  async getChannel(id: number) {
    return await m.request<UaClientChannelConfig>({
      method: 'GET',
      url: this._baseUrl + 'client/channel/' + id,
      withCredentials: true,
    });
  }

  async createChannel(clientId: number, channel: UaClientChannelConfig) {
    return await m.request<UaClientChannelConfig>({
      method: 'POST',
      url: this._baseUrl + 'client/' + clientId + '/channel',
      body: channel,
      withCredentials: true,
    });
  }

  async updateChannel(channel: UaClientChannelConfig) {
    return await m.request<UaClientChannelConfig>({
      method: 'PUT',
      url: this._baseUrl + 'client/channel/' + channel.id,
      body: channel,
      withCredentials: true,
    });
  }

  async deleteChannel(id: number) {
    return await m.request<UaClientChannelConfig>({
      method: 'DELETE',
      url: this._baseUrl + 'client/channel/' + id,
      withCredentials: true,
    });
  }
}
