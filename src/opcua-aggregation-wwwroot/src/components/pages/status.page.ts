import m from 'mithril';
import { StatusPageModel } from '../../models/ua-client.model';

export const StatusPage = {
  oninit: async (vnode: { attrs: { statusModel: StatusPageModel } }) =>
    await vnode.attrs.statusModel.init(),

  view: (vnode: { attrs: { statusModel: StatusPageModel } }) =>
    m(
      'div',
      { class: 'w-full overflow-hidden rounded-lg border border-gray-400' },
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
          vnode.attrs.statusModel.list?.map((status) =>
            m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
              m('td', { class: 'p-3' }, status.sessionName),
              m('td', { class: 'p-3' }, status.serverUri),
              m('td', { class: 'p-3' }, status.connectError),
              m(
                'td',
                { class: 'p-3' },
                m(
                  m.route.Link,
                  {
                    class:
                      'font-sans antialiased text-sm text-current font-medium hover:text-primary',
                    href: '/status/' + status.id,
                  },
                  'Details'
                )
              ),
            ])
          )
        ),
      ])
    ),
};
