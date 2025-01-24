import m from 'mithril';
import { UaClientStatus } from '../models/ua-client.model';

export class ClientStatusService {
  constructor(private _baseUrl: string = 'http://localhost:5000/') {}

  async getClientStatuses(): Promise<UaClientStatus[]> {
    return await m.request<UaClientStatus[]>({
      method: 'GET',
      url: this._baseUrl + 'api/aggregation/status',
      withCredentials: true,
    });
  }

  async getClientStatus(id: number): Promise<UaClientStatus> {
    return await m.request<UaClientStatus>({
      method: 'GET',
      url: this._baseUrl + 'api/aggregation/status',
      params: { sessionId: id },
      withCredentials: true,
    });
  }
}
