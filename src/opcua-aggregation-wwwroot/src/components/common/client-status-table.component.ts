import m from 'mithril';
import { UaClientStatus } from '../../models/status/ua-client-status.model';

const StatusTableRowComponent = {
  view: (vnode: { attrs: { status: UaClientStatus } }) =>
    m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
      m('td', { class: 'p-3' }, vnode.attrs.status?.sessionName),
      m('td', { class: 'p-3' }, vnode.attrs.status?.serverUri),
      m('td', { class: 'p-3' }, vnode.attrs.status?.connectError),
      m(
        'td',
        { class: 'p-3' },
        m(
          m.route.Link,
          {
            class:
              'font-sans antialiased text-sm text-current font-medium hover:text-primary',
            href: '/status/' + vnode.attrs.status?.id,
          },
          'Details'
        )
      ),
    ]),
};

export const ClientStatusTableComponent = {
  view: (vnode: { attrs: { statuses: UaClientStatus[] } }) =>
    m('table', { class: 'w-full' }, [
      m(
        'thead',
        {
          class:
            'border-b border-gray-400 bg-gray-400 text-gray-900 text-sm font-medium',
        },
        [
          m('tr', [
            m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Name'),
            m(
              'th',
              { class: 'px-2.5 py-2 text-start font-medium' },
              'Server Uri'
            ),
            m(
              'th',
              { class: 'px-2.5 py-2 text-start font-medium' },
              'Connect Error'
            ),
            m(
              'th',
              { class: 'px-2.5 py-2 text-start font-medium' },
              'Monitored Items'
            ),
          ]),
        ]
      ),
      m(
        'tbody',
        { class: 'group text-sm' },
        vnode.attrs.statuses?.map((status) =>
          m(StatusTableRowComponent, { status })
        )
      ),
    ]),
};
