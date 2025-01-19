import m from 'mithril';
import { NavBar } from './navbar';

export const Layout = {
  view: (vnode) => m('main.layout', [m(NavBar), m('section', vnode.children)]),
};
