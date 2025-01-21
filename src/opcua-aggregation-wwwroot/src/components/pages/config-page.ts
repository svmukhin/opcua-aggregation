import m from 'mithril';

export const UaClientListPage = {
  view: () => m('div', m('p', 'Page for list of UaClients')),
};

export const UaClientConfigPage = {
  view: (vnode) =>
    m('div', m('p', 'Config page for clients with id ' + vnode.attrs.key)),
};
