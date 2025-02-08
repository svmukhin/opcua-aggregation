import m from 'mithril';
import { CardComponent } from '../shared/card.component';
import { ClientConfigDetailsComponent } from '../common/config/client-config-details.component';
import { ClientSubscriptionDetailsComponent } from '../common/config/client-subscription-details.component';
import { ClientChannelsTableComponent } from '../common/config/client-channels-table.component';
import { ConfigDetailsPageModel } from '../../models/config/config-details-page.model';
import { container } from '../../utils/di-container';

interface ConfigDetailsPageAttrs {
  id: number;
}

export class ConfigDetailsPage implements m.Component<ConfigDetailsPageAttrs> {
  private configModel: ConfigDetailsPageModel;
  constructor() {
    this.configModel = container.resolve<ConfigDetailsPageModel>(
      'ConfigDetailsPageModel'
    );
  }

  async oninit(vnode: m.Vnode<ConfigDetailsPageAttrs>) {
    await this.configModel.load(vnode.attrs.id);
    await this.configModel.loadChannels();
  }

  view(vnode: m.Vnode<ConfigDetailsPageAttrs>) {
    return m('div', [
      m('div', { class: 'flex flex-wrap' }, [
        m(
          CardComponent,
          m(ClientConfigDetailsComponent, {
            config: this.configModel.current,
          })
        ),
        m(
          CardComponent,
          m(ClientSubscriptionDetailsComponent, {
            config: this.configModel.current,
          })
        ),
      ]),
      m('div', { class: 'flex flex-col' }, [
        m(
          CardComponent,
          m(ClientChannelsTableComponent, {
            channels: this.configModel.current?.channels,
          })
        ),
      ]),
    ]);
  }
}
