import m from 'mithril';

export class ButtonGroupComponent implements m.ClassComponent {
  view(vnode: m.Vnode) {
    return m(
      'div',
      { class: 'm-2 p-2 flex flex-row justify-end items-center' },
      vnode.children
    );
  }
}
