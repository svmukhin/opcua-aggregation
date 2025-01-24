import m from 'mithril';
import { StatusPageModel } from '../../models/ua-client.model';

export const StatusPage = {
  oninit: async (vnode: { attrs: { statusModel: StatusPageModel } }) =>
    await vnode.attrs.statusModel.init(),

  view: (vnode: { attrs: { statusModel: StatusPageModel } }) =>
    m(
      'div',
      { class: '' },
      m('table', { class: 'table table-sm table-striped table-hover' }, [
        m('thead', [
          m('tr', [
            m('th', 'Name'),
            m('th', 'Server Uri'),
            m('th', 'Connect Error'),
            m('th', 'Monitored Items'),
          ]),
        ]),
        m(
          'tbody',
          vnode.attrs.statusModel.list?.map((status) =>
            m('tr', [
              m('td', status.sessionName),
              m('td', status.serverUri),
              m('td', status.connectError),
              m(
                'td',
                m(m.route.Link, { href: '/status/' + status.id }, 'Details')
              ),
            ])
          )
        ),
      ])
    ),
};
