import m from 'mithril';
import { clientStatus, clientStatusList } from '../../models/ua-client.model';
import { MonitoredItemComponent } from '../common/monitored-item.component';

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
      m('h5', 'Session ID: ' + clientStatus.status?.id),
      m('h5', 'Session Name: ' + clientStatus.status?.sessionName),
      m('h5', 'Server URI: ' + clientStatus.status?.serverUri),
      m('h5', 'Connect Error: ' + clientStatus.status?.connectError),
      m('div', [
        m('h5', 'Monitored Items:'),
        m(
          'div',
          { class: 'list-group' },
          clientStatus.status?.monitoredItems?.map((item) => {
            return m(MonitoredItemComponent, { item });
          })
        ),
      ]),
    ]),
};
