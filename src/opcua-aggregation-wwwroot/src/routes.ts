import m, { render } from 'mithril';
import {
  UaClientsStatusPage,
  UaClientStatusPage,
} from './components/pages/status-page';
import {
  UaClientConfigPage,
  UaClientListPage,
} from './components/pages/config-page';
import { Layout } from './components/layout/layout';

export const Routes = {
  '/status': {
    view: () => m(Layout, m(UaClientsStatusPage)),
  },
  '/status/:id': {
    view: (vnode) => m(Layout, m(UaClientStatusPage, vnode.attrs)),
  },
  '/config/uaclient': {
    view: () => m(Layout, m(UaClientListPage)),
  },
  '/config/uaclient/:id': {
    view: (vnode) => m(Layout, m(UaClientConfigPage, vnode.attrs)),
  },
};
