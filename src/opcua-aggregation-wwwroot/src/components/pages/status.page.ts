import m from 'mithril';
import { StatusPageModel } from '../../models/ua-client.model';
import { ClientStatusTableComponent } from '../common/client-status-table.component';
import { CardComponent } from '../shared/card.component';

export const StatusPage = {
  oninit: async (vnode: { attrs: { statusModel: StatusPageModel } }) =>
    await vnode.attrs.statusModel.init(),

  view: (vnode: { attrs: { statusModel: StatusPageModel } }) =>
    m('div', { class: 'flex flex-col' }, [
      m(
        CardComponent,
        m(ClientStatusTableComponent, {
          statuses: vnode.attrs.statusModel.list,
        })
      ),
    ]),
};
