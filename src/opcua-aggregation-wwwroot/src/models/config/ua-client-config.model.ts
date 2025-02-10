import { UaClientChannelConfig } from './ua-client-channel-config.model';

export class UaClientConfig {
  id?: number;
  serverUri: string | undefined;
  sessionName: string | undefined;
  keepAliveInterval?: number;
  reconnectPeriod?: number;
  sessionLifetime?: number;
  description?: string;
  enabled?: boolean;
  channels?: UaClientChannelConfig[];
}
