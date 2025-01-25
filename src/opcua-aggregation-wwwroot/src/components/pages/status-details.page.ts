import m from 'mithril';
import { StatusPageModel } from '../../models/ua-client.model';
import { MonitoredItemTableComponent } from '../common/monitored-item-table.component';
import { ClientStatusDetailsInfoComponent } from '../common/client-status-details-info.component';
import { CardComponent } from '../shared/card.component';

export const StatusDetailsPage = {
  oninit: async (vnode: {
    attrs: { statusModel: StatusPageModel; id: number };
  }) => await vnode.attrs.statusModel.load(vnode.attrs.id),

  view: (vnode: { attrs: { statusModel: StatusPageModel; id: number } }) =>
    m('div', [
      m(
        CardComponent,
        m(ClientStatusDetailsInfoComponent, {
          status: vnode.attrs.statusModel.current,
        })
      ),
      m(
        CardComponent,
        m(MonitoredItemTableComponent, {
          items: vnode.attrs.statusModel.current?.monitoredItems,
        })
      ),
    ]),
};
