import m from 'mithril';
import { ConfigPageModel } from '../../models/config/config-page.model';

export const ConfigPage = {
  oninit: async (vnode: { attrs: { configModel: ConfigPageModel } }) =>
    await vnode.attrs.configModel.init(),

  view: (vnode: { attrs: { configModel: ConfigPageModel } }) =>
    m('div', { class: 'flex flex-col' }, [
      m('p', 'Page for list of UaClients'),
    ]),
};
