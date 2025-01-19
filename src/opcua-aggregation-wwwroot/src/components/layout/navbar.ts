import m from 'mithril';

export const NavBar = {
  view: () =>
    m('nav', [
      m(m.route.Link, { href: '/status' }, 'Status'),
      m(m.route.Link, { href: '/config/uaclient' }, 'Config'),
    ]),
};
