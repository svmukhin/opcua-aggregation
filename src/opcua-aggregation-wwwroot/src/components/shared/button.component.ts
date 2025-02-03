import m from 'mithril';

export interface ButtonAttrs {
  variant?: string;
  onclick: () => void;
}

export class ButtonComponent implements m.ClassComponent<ButtonAttrs> {
  private variants = {
    default:
      'border-gray-200 text-gray-200 hover:text-gray-900 hover:bg-gray-400 focus:ring-gray-600',
    green:
      'border-green-400 text-green-400 hover:text-gray-900 hover:bg-green-400 focus:ring-green-600',
    red: 'border-red-400 text-red-400 hover:text-gray-900 hover:bg-red-400 focus:ring-red-600',
    yellow:
      'border-yellow-400 text-yellow-400 hover:text-gray-900 hover:bg-yellow-400 focus:ring-yellow-600',
  };

  view(vnode: m.Vnode<ButtonAttrs>) {
    return m(
      'button',
      {
        class:
          'border px-5 py-2 mr-2 text-sm rounded-lg focus:ring-4 font-medium text-center focus:outline-none' +
          ' ' +
          this.variants[vnode.attrs.variant ?? 'default'],
        onclick: vnode.attrs.onclick,
      },
      vnode.children
    );
  }
}
