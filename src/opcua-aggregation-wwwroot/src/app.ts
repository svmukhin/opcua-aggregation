import './styles.css';

import m from 'mithril';
import { Layout } from './components/layout/layout';
import { StatusPage } from './components/pages/status.page';
import { StatusDetailsPage } from './components/pages/status-details.page';
import { ConfigPage } from './components/pages/config.page';
import { ConfigDetailsPage } from './components/pages/config-details.page';
import { ClientStatusService } from './services/client-status.service';
import { StatusPageModel } from './models/status/status-page.model';
import { ClientConfigService } from './services/client-config.service';
import { ConfigPageModel } from './models/config/config-page.model';

const content = document.getElementById('content');

const statusService = new ClientStatusService(
  'http://192.168.122.114:5000/api/aggregation/status'
);
const statusModel = new StatusPageModel(statusService);

const configService = new ClientConfigService(
  'http://192.168.122.114:5000/api/aggregation/config/'
);
const configModel = new ConfigPageModel(configService);

const Routes = {
  '/status': {
    render: () => m(Layout, m(StatusPage, { statusModel })),
  },
  '/status/:key': {
    render: (vnode) =>
      m(
        Layout,
        m(StatusDetailsPage, {
          statusModel,
          id: vnode.attrs.key,
        })
      ),
  },
  '/config/uaclient': {
    render: () => m(Layout, m(ConfigPage, { configModel })),
  },
  '/config/uaclient/:key': {
    render: (vnode) =>
      m(Layout, m(ConfigDetailsPage, { configModel, id: vnode.attrs.key })),
  },
};

m.route(content, '/status', Routes);
