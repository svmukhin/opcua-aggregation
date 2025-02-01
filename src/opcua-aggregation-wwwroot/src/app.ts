import m from 'mithril';
import { ILayout } from './components/layout/layout';
import { IConfigDetailsPage } from './components/pages/config-details.page';
import { IConfigPage } from './components/pages/config.page';
import { IStatusDetailsPage } from './components/pages/status-details.page';
import { IStatusPage } from './components/pages/status.page';

export interface IApp {
  Routes: {
    [key: string]: {
      render: (vnode: m.CVnode) => m.Children;
    };
  };
}

export class App implements IApp {
  constructor(
    private _layout: ILayout,
    private _statusPage: IStatusPage,
    private _statusDetailsPage: IStatusDetailsPage,
    private _configPage: IConfigPage,
    private _configDetailsPage: IConfigDetailsPage
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
