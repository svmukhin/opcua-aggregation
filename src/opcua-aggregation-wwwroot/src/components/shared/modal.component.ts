import m from 'mithril';

interface ModalAttrs {
  isOpen: boolean;
  onClose: () => void;
}

export class ModalComponent implements m.Component<ModalAttrs> {
  view(vnode: m.Vnode<ModalAttrs>) {
    const { isOpen, onClose } = vnode.attrs;

    if (!isOpen) {
      return null;
    }

    return m(
      'div',
      {
        onclick: onClose,
        class: 'fixed inset-0 bg-gray-950/50  flex justify-center items-center',
      },
      m(
        'div',
        {
          class: 'bg-gray-800 p-6 rounded-lg max-w-md w-full',
          onclick: (e: Event) => e.stopPropagation(),
        },
        vnode.children
      )
    );
  }
}
