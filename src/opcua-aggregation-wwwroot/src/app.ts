import './styles.css';

import m from 'mithril';
import { Layout } from './components/layout/layout';
import { IStatusPage, StatusPage } from './components/pages/status.page';
import {
  IStatusDetailsPage,
  StatusDetailsPage,
} from './components/pages/status-details.page';
import { ConfigPage, IConfigPage } from './components/pages/config.page';
import {
  ConfigDetailsPage,
  IConfigDetailsPage,
} from './components/pages/config-details.page';
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

container.registerSingleton<IStatusPage, StatusPage>();
container.registerSingleton<IStatusDetailsPage, StatusDetailsPage>();

container.registerSingleton<IConfigPage, ConfigPage>();
container.registerSingleton<IConfigDetailsPage, ConfigDetailsPage>();

const Routes = {
  '/status': {
    render: () => m(Layout, m(container.get<IStatusPage>())),
  },
  '/status/:key': {
    render: (vnode) =>
      m(
        Layout,
        m(container.get<IStatusDetailsPage>(), {
          id: vnode.attrs.key,
        })
      ),
  },
  '/config/uaclient': {
    render: () => m(Layout, m(container.get<IConfigPage>())),
  },
  '/config/uaclient/:key': {
    render: (vnode) =>
      m(
        Layout,
        m(container.get<IConfigDetailsPage>(), { id: vnode.attrs.key })
      ),
  },
};

m.route(content, '/status', Routes);
