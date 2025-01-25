import m from 'mithril';
import { Header } from './header';
import { Footer } from './footer';

const header = document.getElementById('header');
const footer = document.getElementById('footer');

export const Layout = {
  oninit: () => {
    m.mount(header, Header);
    m.mount(footer, Footer);
  },
  view: (vnode) =>
    m('div', { class: 'w-full max-w-screen-xl' }, vnode.children),
};
