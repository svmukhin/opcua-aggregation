import m from 'mithril';

export const CardComponent = {
  view: (vnode) =>
    m(
      'div',
      { class: 'm-2 p-2 overflow-hidden rounded-lg border border-gray-400' },
      vnode.children
    ),
};
