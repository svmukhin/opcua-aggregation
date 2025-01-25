import m from 'mithril';
import { StatusPageModel } from '../../models/ua-client.model';
import { MonitoredItemTableComponent } from '../common/monitored-item-table.component';

export const StatusDetailsPage = {
  oninit: async (vnode: {
    attrs: { statusModel: StatusPageModel; id: number };
  }) => await vnode.attrs.statusModel.load(vnode.attrs.id),

  view: (vnode: { attrs: { statusModel: StatusPageModel; id: number } }) =>
    m('div', [
      m('div', { class: 'overflow-hidden rounded-lg border border-gray-400' }, [
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
      ]),
      m(
        'div',
        {
          class:
            'mt-3 w-full overflow-hidden rounded-lg border border-gray-400',
        },
        m(MonitoredItemTableComponent, {
          items: vnode.attrs.statusModel.current?.monitoredItems,
        })
      ),
    ]),
};
