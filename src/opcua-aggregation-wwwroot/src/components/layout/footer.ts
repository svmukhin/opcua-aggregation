import m from 'mithril';

export const Footer = {
  view: () =>
    m(
      'footer',
      {
        class:
          'rounded-lg border shadow-lg overflow-hidden p-2 bg-white border-stone-200 shadow-stone-950/5 mx-auto w-full max-w-screen-xl',
      },
      m(
        'p',
        { class: 'font-sans antialiased text-base text-current text-center' },
        'OPC UA Aggregation Client'
      )
    ),
};
