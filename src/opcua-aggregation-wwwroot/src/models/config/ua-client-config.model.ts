import { UaClientChannelConfig } from './ua-client-channel-config.model';

export class UaClientConfig {
  id?: number;
  serverUri: string;
  sessionName: string;
  keepAliveInterval?: number;
  reconnectPeriod?: number;
  sessionLifetime?: number;
  description?: string;
  enabled?: boolean;
  channels?: UaClientChannelConfig[];
}
