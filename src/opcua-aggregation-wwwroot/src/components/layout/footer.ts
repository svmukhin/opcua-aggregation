import m from 'mithril';

export const Footer = {
  view: () =>
    m(
      'footer',
      {
        class:
          'rounded-lg border overflow-hidden p-2 border-gray-400 mx-auto w-full max-w-screen-xl',
      },
      m(
        'p',
        { class: 'font-sans antialiased text-base text-current text-center' },
        'OPC UA Aggregation Client'
      )
    ),
};
