import m from 'mithril';
import { ConfigPageModel } from '../../models/config/config-page.model';
import { ClientConfigTableComponent } from '../common/client-config-table.component';
import { CardComponent } from '../shared/card.component';

export const ConfigPage = {
  oninit: async (vnode: { attrs: { configModel: ConfigPageModel } }) =>
    await vnode.attrs.configModel.init(),

  view: (vnode: { attrs: { configModel: ConfigPageModel } }) =>
    m('div', { class: 'flex flex-col' }, [
      m(
        CardComponent,
        m(ClientConfigTableComponent, { configs: vnode.attrs.configModel.list })
      ),
    ]),
};
