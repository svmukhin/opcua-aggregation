import m from 'mithril';

export const Header = {
  view: () =>
    m(
      'nav',
      { class: 'navbar navbar-expand-lg navbar-light bg-body-tertiary' },
      m('div', { class: 'container' }, [
        m(
          m.route.Link,
          { class: 'navbar-brand', href: '/status' },
          'UA Aggregation'
        ),
        m(
          'button',
          {
            class: 'navbar-toggler',
            type: 'button',
            'data-bs-toggle': 'collapse',
            'data-bs-target': '#navbarNav',
            'aria-controls': 'navbarNav',
            'aria-expanded': 'false',
            'aria-label': 'Toggle navigation',
          },
          m('span', { class: 'navbar-toggler-icon' })
        ),
        m(
          'div',
          {
            class: 'collapse navbar-collapse justify-content-center',
            id: 'navbarNav',
          },
          [
            m('ul', { class: 'navbar-nav' }, [
              m(
                'li',
                { class: 'nav-item' },
                m(
                  m.route.Link,
                  {
                    class: 'nav-link active',
                    'aria-current': 'page',
                    href: '/status',
                  },
                  'Status'
                )
              ),
              m(
                'li',
                { class: 'nav-item' },
                m(
                  m.route.Link,
                  {
                    class: 'nav-link active',
                    'aria-current': 'page',
                    href: '/config/uaclient',
                  },
                  'Config'
                )
              ),
            ]),
          ]
        ),
      ])
    ),
};
