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
import { StatusPageModel } from './models/status/status-page.model';
import { StatusDetailsPageModel } from './models/status/status-details-page.model';
import { ConfigPageModel } from './models/config/config-page.model';
import { ConfigDetailsPageModel } from './models/config/config-details-page.model';

const content = document.getElementById('content');

const API_BASE_URL = 'http://192.168.122.114:5000/api/aggregation';

container.register(
  'IClientStatusService',
  () => new ClientStatusService(API_BASE_URL + '/status')
);
container.register(
  'IClientConfigService',
  () => new ClientConfigService(API_BASE_URL + '/config/')
);

container.register('StatusPageModel', StatusPageModel);
container.register('StatusDetailsPageModel', StatusDetailsPageModel);
container.register('ConfigPageModel', ConfigPageModel);
container.register('ConfigDetailsPageModel', ConfigDetailsPageModel);

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
  '/config/uaclient': {
    render: () => m(Layout, m(ConfigPage)),
  },
  '/config/uaclient/:key': {
    render: (vnode) => m(Layout, m(ConfigDetailsPage, { id: vnode.attrs.key })),
  },
};

m.route(content, '/status', Routes);
