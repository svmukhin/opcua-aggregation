import m from 'mithril';
import { ConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigDetailsComponent } from '../common/config/client-config-details.component';
import { ClientSubscriptionDetailsComponent } from '../common/config/client-subscription-details.component';

export const ConfigDetailsPage = {
  oninit: async (vnode: {
    attrs: { configModel: ConfigPageModel; id: number };
  }) => await vnode.attrs.configModel.load(vnode.attrs.id),

  view: (vnode: { attrs: { configModel: ConfigPageModel; id: number } }) =>
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
    ]),
};
