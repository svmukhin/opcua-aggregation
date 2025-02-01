import m from 'mithril';
import { Header, IHeader } from './header';
import { Footer, IFooter } from './footer';

const headerContainer = document.getElementById('header');
const footerContainer = document.getElementById('footer');

export interface ILayout {
  oninit(): void;
  view(vnode: m.Vnode): m.Children;
}

export class Layout implements ILayout {
  constructor(private _header: IHeader, private _footer: IFooter) {}

  oninit() {
    m.mount(headerContainer, this._header);
    m.mount(footerContainer, this._footer);
  }
  view(vnode) {
    return m('div', { class: 'w-full max-w-screen-xl' }, vnode.children);
  }
}
