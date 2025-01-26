import m from 'mithril';

export const ConfigDetailsPage = {
  view: (vnode) =>
    m('div', m('p', 'Config page for clients with id ' + vnode.attrs.key)),
};
