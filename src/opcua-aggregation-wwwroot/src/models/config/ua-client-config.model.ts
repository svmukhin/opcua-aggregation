import { UaClientChannelConfig } from './ua-client-channel-config.model';

export class UaClientConfig {
  id: number | undefined;
  serverUri: string;
  sessionName: string;
  keepAliveInterval: number;
  reconnectPeriod: number;
  sessionLifetime: number;
  description: string | undefined;
  enabled: boolean;
  channels: UaClientChannelConfig[] | undefined;
}
