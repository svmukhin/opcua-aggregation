import m from 'mithril';
import { MonitoredItemComponent } from '../common/monitored-item.component';
import { StatusPageModel } from '../../models/ua-client.model';
import { MonitoredItem } from '../../models/monitored-item.model';

export const StatusDetailsPage = {
  oninit: async (vnode: {
    attrs: { statusModel: StatusPageModel; id: number };
  }) => await vnode.attrs.statusModel.load(vnode.attrs.id),

  view: (vnode: { attrs: { statusModel: StatusPageModel; id: number } }) =>
    m('div', [
      m('h3', 'UaClient: '),
      m('h5', 'Session ID: ' + vnode.attrs.statusModel.current?.id),
      m('h5', 'Session Name: ' + vnode.attrs.statusModel.current?.sessionName),
      m('h5', 'Server URI: ' + vnode.attrs.statusModel.current?.serverUri),
      m(
        'h5',
        'Connect Error: ' + vnode.attrs.statusModel.current?.connectError
      ),
      m('div', [
        m('h5', 'Monitored Items:'),
        m(
          'div',
          { class: 'list-group' },
          vnode.attrs.statusModel.current?.monitoredItems?.map((item) => {
            return m(MonitoredItemComponent, { item });
          })
        ),
      ]),
    ]),
};
