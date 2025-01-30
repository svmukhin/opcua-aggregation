import m from 'mithril';
import { IStatusPageModel } from '../../models/status/status-page.model';
import { ClientStatusTableComponent } from '../common/status/client-status-table.component';
import { CardComponent } from '../shared/card.component';

export const StatusPage = {
  oninit: async (vnode: { attrs: { statusModel: IStatusPageModel } }) =>
    await vnode.attrs.statusModel.init(),

  view: (vnode: { attrs: { statusModel: IStatusPageModel } }) =>
    m('div', { class: 'flex flex-col' }, [
      m(
        CardComponent,
        m(ClientStatusTableComponent, {
          statuses: vnode.attrs.statusModel.list,
        })
      ),
    ]),
};
