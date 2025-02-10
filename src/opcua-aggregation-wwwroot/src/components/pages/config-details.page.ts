import m from 'mithril';
import { CardComponent } from '../shared/card.component';
import { ClientConfigDetailsComponent } from '../common/config/client-config-details.component';
import { ClientSubscriptionDetailsComponent } from '../common/config/client-subscription-details.component';
import { ClientChannelsTableComponent } from '../common/config/client-channels-table.component';
import { container } from '../../utils/di-container';
import { UaClientConfig } from '../../models/config/ua-client-config.model';
import { IClientConfigService } from '../../services/client-config.service';

interface ConfigDetailsPageAttrs {
  id: number;
}

export class ConfigDetailsPage implements m.Component<ConfigDetailsPageAttrs> {
  private _service: IClientConfigService;
  config: UaClientConfig | undefined;

  constructor() {
    this._service = container.resolve<IClientConfigService>(
      'IClientConfigService'
    );
  }

  async oninit(vnode: m.Vnode<ConfigDetailsPageAttrs>) {
    this.config = await this._service.getClientConfig(vnode.attrs.id);
    this.config.channels = await this._service.getClientChannels(
      this.config.id!
    );
  }

  view(vnode: m.Vnode<ConfigDetailsPageAttrs>) {
    return m('div', [
      m('div', { class: 'flex flex-wrap' }, [
        m(
          CardComponent,
          m(ClientConfigDetailsComponent, {
            config: this.config,
          })
        ),
        m(
          CardComponent,
          m(ClientSubscriptionDetailsComponent, {
            config: this.config,
          })
        ),
      ]),
      m('div', { class: 'flex flex-col' }, [
        m(
          CardComponent,
          m(ClientChannelsTableComponent, {
            channels: this.config?.channels,
          })
        ),
      ]),
    ]);
  }
}
