import m from 'mithril';
import { UaClientStatus } from '../models/status/ua-client-status.model';

export interface IClientStatusService {
  getClientStatuses(): Promise<UaClientStatus[]>;
  getClientStatus(id: number): Promise<UaClientStatus>;
}

export class ClientStatusService implements IClientStatusService {
  constructor(
    private _baseUrl: string = 'http://localhost:5000/api/aggregation/status'
  ) {}

  async getClientStatuses(): Promise<UaClientStatus[]> {
    return await m.request<UaClientStatus[]>({
      method: 'GET',
      url: this._baseUrl,
      withCredentials: true,
    });
  }

  async getClientStatus(id: number): Promise<UaClientStatus> {
    return await m.request<UaClientStatus>({
      method: 'GET',
      url: this._baseUrl,
      params: { sessionId: id },
      withCredentials: true,
    });
  }
}
