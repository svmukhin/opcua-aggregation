import m from 'mithril';
import { Header } from './header';
import { Footer } from './footer';

const headerContainer = document.getElementById('header');
const footerContainer = document.getElementById('footer');

export class Layout implements m.ClassComponent {
  constructor(private _header: Header, private _footer: Footer) {}

  oninit() {
    m.mount(headerContainer, this._header);
    m.mount(footerContainer, this._footer);
  }
  view(vnode) {
    return m('div', { class: 'w-full max-w-screen-xl' }, vnode.children);
  }
}
