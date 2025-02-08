import m from 'mithril';
import { Header } from './header';
import { Footer } from './footer';

const headerContainer = document.getElementById('header');
const footerContainer = document.getElementById('footer');

export class Layout implements m.ClassComponent {
  oninit() {
    m.mount(headerContainer, Header);
    m.mount(footerContainer, Footer);
  }
  view(vnode) {
    return m('div', { class: 'w-full max-w-screen-xl' }, vnode.children);
  }
}
