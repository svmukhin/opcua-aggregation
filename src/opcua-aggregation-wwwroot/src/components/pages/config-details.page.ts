import m from 'mithril';
import { IConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigDetailsComponent } from '../common/config/client-config-details.component';
import { ClientSubscriptionDetailsComponent } from '../common/config/client-subscription-details.component';
import { ClientChannelsTableComponent } from '../common/config/client-channels-table.component';

export interface IConfigDetailsPage {
  oninit(vnode: { attrs: { id: number } }): Promise<void>;
  view();
}

export class ConfigDetailsPage {
  constructor(private configModel: IConfigPageModel) {}

  async oninit(vnode: { attrs: { id: number } }) {
    await this.configModel.load(vnode.attrs.id);
    await this.configModel.loadChannels();
  }

  view() {
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
