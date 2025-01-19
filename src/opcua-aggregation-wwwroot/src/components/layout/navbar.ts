import m from 'mithril';

export const NavBar = {
  view: () =>
    m(
      'nav',
      {
        class:
          'navbar navbar-expand-sm bg-body-tertiary justify-content-center',
      },
      m(
        'div',
        { class: 'container-fluid' },
        m('ul', { class: 'navbar-nav' }, [
          m(
            'li',
            { class: 'nav-item' },
            m(m.route.Link, { class: 'nav-link', href: '/status' }, 'Status')
          ),
          m(
            'li',
            { class: 'nav-item' },
            m(
              m.route.Link,
              { class: 'nav-link', href: '/config/uaclient' },
              'Config'
            )
          ),
        ])
      )
    ),
};
