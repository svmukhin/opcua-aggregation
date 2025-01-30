import m from 'mithril';
import { IStatusPageModel } from '../../models/status/status-page.model';
import { MonitoredItemTableComponent } from '../common/status/monitored-item-table.component';
import { ClientStatusDetailsInfoComponent } from '../common/status/client-status-details-info.component';
import { CardComponent } from '../shared/card.component';

export const StatusDetailsPage = {
  oninit: async (vnode: {
    attrs: { statusModel: IStatusPageModel; id: number };
  }) => await vnode.attrs.statusModel.load(vnode.attrs.id),

  view: (vnode: { attrs: { statusModel: IStatusPageModel; id: number } }) =>
    m('div', [
      m('div', { class: 'flex flex-wrap' }, [
        m(
          CardComponent,
          m(ClientStatusDetailsInfoComponent, {
            status: vnode.attrs.statusModel.current,
          })
        ),
      ]),
      m('div', { class: 'flex flex-col' }, [
        m(
          CardComponent,
          m(MonitoredItemTableComponent, {
            items: vnode.attrs.statusModel.current?.monitoredItems,
          })
        ),
      ]),
    ]),
};
