import m from 'mithril';
import { clientStatus, clientStatusList } from '../../models/uaclient-model';

export const UaClientsStatusPage = {
  oninit: clientStatusList.loadList,
  view: () =>
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
          clientStatusList.list.map((status) =>
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

export const UaClientStatusPage = {
  oninit: (vnode) => {
    clientStatus.loadStatus(vnode.attrs.key);
  },
  view: () =>
    m('div', [
      m('h3', 'UaClient: '),
      m('p', 'Session ID: ' + clientStatus.status?.id),
      m('p', 'Session Name: ' + clientStatus.status?.sessionName),
      m('p', 'Server URI: ' + clientStatus.status?.serverUri),
      m('p', 'Connect Error: ' + clientStatus.status?.connectError),
      m('div', [
        m('p', 'Monitored Items:'),
        m(
          'ol',
          { class: 'list-group list-group-numbered' },
          clientStatus.status?.monitoredItems?.map((item) => {
            return m('li', { class: 'list-group-item' }, item);
          })
        ),
      ]),
    ]),
};
