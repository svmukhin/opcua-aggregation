import m from 'mithril';

export class ButtonGroupComponent implements m.ClassComponent {
  view(vnode: m.Vnode) {
    return m(
      'div',
      { class: 'm-1 p-1 flex flex-row justify-end items-center' },
      vnode.children
    );
  }
}
