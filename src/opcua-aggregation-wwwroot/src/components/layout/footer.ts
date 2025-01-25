import m from 'mithril';

export const Footer = {
  view: () =>
    m(
      'footer',
      { class: 'w-full' },
      m(
        'p',
        { class: 'font-sans antialiased text-base text-current text-center' },
        'OPC UA Aggregation Client'
      )
    ),
};
