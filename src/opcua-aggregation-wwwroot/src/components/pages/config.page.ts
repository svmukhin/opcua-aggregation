import m from 'mithril';
import { IConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigTableComponent } from '../common/config/client-config-table.component';

export const ConfigPage = {
  oninit: async (vnode: { attrs: { configModel: IConfigPageModel } }) =>
    await vnode.attrs.configModel.init(),

  view: (vnode: { attrs: { configModel: IConfigPageModel } }) =>
    m('div', { class: 'flex flex-col' }, [
      m(
        CardComponent,
        m(ClientConfigTableComponent, { configs: vnode.attrs.configModel.list })
      ),
    ]),
};
