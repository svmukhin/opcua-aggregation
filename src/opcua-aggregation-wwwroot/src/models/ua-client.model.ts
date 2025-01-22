import m from 'mithril';
import { MonitoredItem } from './monitored-item.model';

export interface UaClientstatus {
  id: string;
  serverUri: string;
  sessionName: string;
  connectError: number;
  monitoredItems: MonitoredItem[];
}

export const clientStatusList = {
  list: [] as UaClientstatus[],
  loadList: async () => {
    clientStatusList.list = (await m.request({
      method: 'GET',
      url: 'http://192.168.122.114:5000/api/aggregation/status',
      withCredentials: true,
    })) as UaClientstatus[];
  },
};

export const clientStatus = {
  status: {} as UaClientstatus,
  loadStatus: async (id) => {
    clientStatus.status = (await m.request({
      method: 'GET',
      url: 'http://192.168.122.114:5000/api/aggregation/status',
      params: { sessionId: id },
      withCredentials: true,
    })) as UaClientstatus;
  },
};
