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
import {
  IStatusDetailsPageModel,
  StatusDetailsPageModel,
} from './models/status/status-details-page.model';
import {
  IConfigDetailsPageModel,
  ConfigDetailsPageModel,
} from './models/config/config-details-page.model';

const content = document.getElementById('content');

const API_BASE_URL = 'http://192.168.122.114:5000/api/aggregation';
const container = new DIContainer();

container.registerSingleton<IClientStatusService>(
  () => new ClientStatusService(API_BASE_URL + '/status')
);
container.registerSingleton<IClientConfigService>(
  () => new ClientConfigService(API_BASE_URL + '/config/')
);
container.registerSingleton<IStatusPageModel, StatusPageModel>();
container.registerTransient<IStatusDetailsPageModel, StatusDetailsPageModel>();
container.registerSingleton<IConfigPageModel, ConfigPageModel>();
container.registerTransient<IConfigDetailsPageModel, ConfigDetailsPageModel>();

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
