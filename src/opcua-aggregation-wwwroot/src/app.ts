import m from 'mithril';
import { Layout } from './components/layout/layout';
import {
  UaClientsStatusPage,
  UaClientStatusPage,
} from './components/pages/status.page';
import {
  UaClientConfigPage,
  UaClientListPage,
} from './components/pages/config.page';

const content = document.getElementById('content');

const Routes = {
  '/status': {
    render: () => m(Layout, m(UaClientsStatusPage)),
  },
  '/status/:key': {
    render: (vnode) => m(Layout, m(UaClientStatusPage, vnode.attrs)),
  },
  '/config/uaclient': {
    render: () => m(Layout, m(UaClientListPage)),
  },
  '/config/uaclient/:key': {
    render: (vnode) => m(Layout, m(UaClientConfigPage, vnode.attrs)),
  },
};

m.route(content, '/status', Routes);
