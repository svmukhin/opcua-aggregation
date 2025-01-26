import './styles.css';

import m from 'mithril';
import { Layout } from './components/layout/layout';
import { StatusPage } from './components/pages/status.page';
import { StatusDetailsPage } from './components/pages/status-details.page';
import { ConfigPage } from './components/pages/config.page';
import { ConfigDetailsPage } from './components/pages/config-details.page';
import { ClientStatusService } from './services/client-status.service';
import { StatusPageModel } from './models/status/status-page.model';

const content = document.getElementById('content');

const statusService = new ClientStatusService('http://192.168.122.114:5000/');
const statusModel = new StatusPageModel(statusService);

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
    render: () => m(Layout, m(ConfigPage)),
  },
  '/config/uaclient/:key': {
    render: (vnode) => m(Layout, m(ConfigDetailsPage, vnode.attrs)),
  },
};

m.route(content, '/status', Routes);
