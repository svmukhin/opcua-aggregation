import m from 'mithril';

export const Header = {
  view: () =>
    m(
      'nav',
      {
        class:
          'rounded-lg border overflow-hidden p-2 border-gray-400 mx-auto w-full max-w-screen-xl',
      },
      m('div', { class: 'flex items-center' }, [
        m(
          m.route.Link,
          {
            class:
              'font-sans antialiased text-xl text-current mx-2 block py-1 font-semibold',
            href: '/status',
          },
          'UA Aggregation'
        ),
        m('div', { class: 'ml-auto mr-2 block' }, [
          m(
            'ul',
            {
              class: 'm-2 flex flex-row gap-x-3 gap-y-1 m-0 items-center',
            },
            [
              m(
                'li',
                m(
                  m.route.Link,
                  {
                    class:
                      'font-sans antialiased text-xl text-current p-1 hover:text-primary',
                    href: '/status',
                  },
                  'Status'
                )
              ),
              m(
                'li',
                m(
                  m.route.Link,
                  {
                    class:
                      'font-sans antialiased text-xl text-current p-1 hover:text-primary',
                    href: '/config/uaclient',
                  },
                  'Config'
                )
              ),
            ]
          ),
        ]),
      ])
    ),
};
