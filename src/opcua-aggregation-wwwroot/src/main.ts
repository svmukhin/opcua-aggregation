import './styles.css';

import m from 'mithril';
import { ClientStatusService } from './services/client-status.service';
import { ClientConfigService } from './services/client-config.service';
import { Layout } from './components/layout/layout';
import { ConfigDetailsPage } from './components/pages/config-details.page';
import { ConfigPage } from './components/pages/config.page';
import { StatusDetailsPage } from './components/pages/status-details.page';
import { StatusPage } from './components/pages/status.page';
import { container } from './utils/di-container';

const content = document.getElementById('content');

const API_BASE_URL = 'http://192.168.122.114:5000/api/aggregation';

container.registerSingleton(
  'IClientStatusService',
  () => new ClientStatusService(API_BASE_URL + '/status')
);
container.registerSingleton(
  'IClientConfigService',
  () => new ClientConfigService(API_BASE_URL + '/config/')
);

const Routes: m.RouteDefs = {
  '/status': {
    render: () => m(Layout, m(StatusPage)),
  },
  '/status/:key': {
    render: (vnode) =>
      m(
        Layout,
        m(StatusDetailsPage, {
          id: vnode.attrs.key,
        })
      ),
  },
  '/config': {
    render: () => m(Layout, m(ConfigPage)),
  },
  '/config/:key': {
    render: (vnode) => m(Layout, m(ConfigDetailsPage, { id: vnode.attrs.key })),
  },
};

m.route(content!, '/status', Routes);
