import m from 'mithril';
import { IConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigDetailsComponent } from '../common/config/client-config-details.component';
import { ClientSubscriptionDetailsComponent } from '../common/config/client-subscription-details.component';
import { ClientChannelsTableComponent } from '../common/config/client-channels-table.component';

export const ConfigDetailsPage = {
  oninit: async (vnode: {
    attrs: { configModel: IConfigPageModel; id: number };
  }) => {
    await vnode.attrs.configModel.load(vnode.attrs.id);
    await vnode.attrs.configModel.loadChannels();
  },

  view: (vnode: { attrs: { configModel: IConfigPageModel; id: number } }) =>
    m('div', [
      m('div', { class: 'flex flex-wrap' }, [
        m(
          CardComponent,
          m(ClientConfigDetailsComponent, {
            config: vnode.attrs.configModel.current,
          })
        ),
        m(
          CardComponent,
          m(ClientSubscriptionDetailsComponent, {
            config: vnode.attrs.configModel.current,
          })
        ),
      ]),
      m('div', { class: 'flex flex-col' }, [
        m(
          CardComponent,
          m(ClientChannelsTableComponent, {
            channels: vnode.attrs.configModel.current?.channels,
          })
        ),
      ]),
    ]),
};
