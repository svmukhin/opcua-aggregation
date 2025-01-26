import m from 'mithril';

export class ClientConfigService {
  constructor(
    private _baseUrl = 'http://localhost:5000/api/aggregation/config/'
  ) {}

  async getClientConfigs() {
    return await m.request({
      method: 'GET',
      url: this._baseUrl + 'client',
      withCredentials: true,
    });
  }

  async getClientConfig(id: number) {
    return await m.request({
      method: 'GET',
      url: this._baseUrl + 'client/' + id,
      withCredentials: true,
    });
  }

  async getClientChanneld(clientId: number) {
    return await m.request({
      method: 'GET',
      url: this._baseUrl + 'client/' + clientId + '/channel',
    });
  }

  async getChannel(id: number) {
    return await m.request({
      method: 'GET',
      url: this._baseUrl + 'client/channel/' + id,
    });
  }
}
