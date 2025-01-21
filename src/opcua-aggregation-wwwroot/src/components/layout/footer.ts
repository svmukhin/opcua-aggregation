import m from 'mithril';

export const Footer = {
  view: () =>
    m(
      'footer',
      { class: 'footer mt-auto py-3 bg-body-tertiary fixed-bottom' },
      m(
        'div',
        { class: 'container' },
        m('span', { class: 'text-muted' }, 'OPC UA Aggregation Client')
      )
    ),
};
