import m from 'mithril';

export interface IFooter {
  view(): m.Children;
}

export class Footer implements IFooter {
  view() {
    return m(
      'footer',
      {
        class:
          'border-t overflow-hidden p-2 border-gray-400 mx-auto w-full max-w-screen-xl',
      },
      m(
        'p',
        { class: 'font-sans antialiased text-base text-current text-center' },
        'OPC UA Aggregation Client'
      )
    );
  }
}
