import './styles.css';

import m from 'mithril';
import { ILayout, Layout } from './components/layout/layout';
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
import { Header, IHeader } from './components/layout/header';
import { Footer, IFooter } from './components/layout/footer';
import { App, IApp } from './app';

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
container.registerTransient<IStatusDetailsPage, StatusDetailsPage>();

container.registerSingleton<IConfigPage, ConfigPage>();
container.registerTransient<IConfigDetailsPage, ConfigDetailsPage>();

container.registerSingleton<IHeader, Header>();
container.registerSingleton<IFooter, Footer>();
container.registerSingleton<ILayout, Layout>();

container.registerSingleton<IApp, App>();

const app = container.get<IApp>();

m.route(content, '/status', app.Routes);
