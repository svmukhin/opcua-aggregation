import { UaClientChannelConfig } from './ua-client-channel-config.model';

export class UaClientConfig {
  id?: number | undefined;
  serverUri: string | undefined;
  sessionName: string | undefined;
  keepAliveInterval?: number;
  reconnectPeriod?: number;
  sessionLifetime?: number;
  description?: string;
  enabled?: boolean;
  channels?: UaClientChannelConfig[];

  constructor(data: Partial<UaClientConfig>) {
    Object.assign(this, data);
  }
}
