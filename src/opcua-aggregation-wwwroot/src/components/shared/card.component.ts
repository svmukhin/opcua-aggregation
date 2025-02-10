import m from 'mithril';

export class CardComponent implements m.ClassComponent {
  view(vnode: m.Vnode): m.Children | null | void {
    return m(
      'div',
      { class: 'm-2 p-2 overflow-hidden rounded-lg border border-gray-400' },
      vnode.children
    );
  }
}
