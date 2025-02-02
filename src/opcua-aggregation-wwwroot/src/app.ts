import m from 'mithril';
import { Layout } from './components/layout/layout';
import { ConfigDetailsPage } from './components/pages/config-details.page';
import { ConfigPage } from './components/pages/config.page';
import { StatusDetailsPage } from './components/pages/status-details.page';
import { StatusPage } from './components/pages/status.page';

export interface IApp {
  Routes: {
    [key: string]: {
      render: (vnode: m.CVnode) => m.Children;
    };
  };
}

export class App implements IApp {
  constructor(
    private _layout: Layout,
    private _statusPage: StatusPage,
    private _statusDetailsPage: StatusDetailsPage,
    private _configPage: ConfigPage,
    private _configDetailsPage: ConfigDetailsPage
  ) {}

  Routes = {
    '/status': {
      render: () => m(this._layout, m(this._statusPage)),
    },
    '/status/:key': {
      render: (vnode) =>
        m(
          this._layout,
          m(this._statusDetailsPage, {
            id: vnode.attrs.key,
          })
        ),
    },
    '/config/uaclient': {
      render: () => m(this._layout, m(this._configPage)),
    },
    '/config/uaclient/:key': {
      render: (vnode) =>
        m(this._layout, m(this._configDetailsPage, { id: vnode.attrs.key })),
    },
  };
}
