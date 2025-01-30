import './styles.css';

import m from 'mithril';
import { Layout } from './components/layout/layout';
import { StatusPage } from './components/pages/status.page';
import { StatusDetailsPage } from './components/pages/status-details.page';
import { ConfigPage } from './components/pages/config.page';
import { ConfigDetailsPage } from './components/pages/config-details.page';
import {
  ClientStatusService,
  IClientStatusService,
} from './services/client-status.service';
import {
  IStatusPageModel,
  StatusPageModel,
} from './models/status/status-page.model';
import {
  ClientConfigService,
  IClientConfigService,
} from './services/client-config.service';
import {
  ConfigPageModel,
  IConfigPageModel,
} from './models/config/config-page.model';
import { DIContainer } from '@wessberg/di';

const content = document.getElementById('content');

const container = new DIContainer();

container.registerSingleton<IClientStatusService>(
  () =>
    new ClientStatusService(
      'http://192.168.122.114:5000/api/aggregation/status'
    )
);
container.registerSingleton<IClientConfigService>(
  () =>
    new ClientConfigService(
      'http://192.168.122.114:5000/api/aggregation/config/'
    )
);
container.registerSingleton<IStatusPageModel, StatusPageModel>();
container.registerSingleton<IConfigPageModel, ConfigPageModel>();

const statusModel = container.get<IStatusPageModel>();
const configModel = container.get<IConfigPageModel>();

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
