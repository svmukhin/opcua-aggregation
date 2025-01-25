import m from 'mithril';
import { MonitoredItemComponent } from '../common/monitored-item.component';
import { StatusPageModel } from '../../models/ua-client.model';

export const StatusDetailsPage = {
  oninit: async (vnode: {
    attrs: { statusModel: StatusPageModel; id: number };
  }) => await vnode.attrs.statusModel.load(vnode.attrs.id),

  view: (vnode: { attrs: { statusModel: StatusPageModel; id: number } }) =>
    m(
      'div',
      { class: 'w-full overflow-hidden rounded-lg border border-stone-200' },
      [
        m('div', { class: 'text-2xl' }, 'UaClient: '),
        m(
          'div',
          { class: 'text-xl' },
          'Session ID: ' + vnode.attrs.statusModel.current?.id
        ),
        m(
          'div',
          { class: 'text-xl' },
          'Session Name: ' + vnode.attrs.statusModel.current?.sessionName
        ),
        m(
          'div',
          { class: 'text-xl' },
          'Server URI: ' + vnode.attrs.statusModel.current?.serverUri
        ),
        m(
          'div',
          { class: 'text-xl' },
          'Connect Error: ' + vnode.attrs.statusModel.current?.connectError
        ),
        m('div', [
          m('div', { class: 'text-xl' }, 'Monitored Items:'),
          m(
            'ul',
            { class: 'flex flex-col gap-0.5 min-w-60' },
            vnode.attrs.statusModel.current?.monitoredItems?.map((item) => {
              return m(MonitoredItemComponent, { item });
            })
          ),
        ]),
      ]
    ),
};
