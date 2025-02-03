import m from 'mithril';
import { UaClientConfig } from '../../../models/config/ua-client-config.model';

interface ConfigTableRowComponentAttrs {
  config: UaClientConfig;
}

interface ClientConfigTableComponentAttrs {
  configs: UaClientConfig[];
}

const ConfigTableRowComponent: m.Component<ConfigTableRowComponentAttrs> = {
  view: (vnode: m.Vnode<ConfigTableRowComponentAttrs>) =>
    m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
      m('td', { class: 'p-3' }, vnode.attrs.config?.sessionName),
      m('td', { class: 'p-3' }, vnode.attrs.config?.serverUri),
      m('td', { class: 'p-3' }, vnode.attrs.config?.description),
      m(
        'td',
        { class: 'p-3' },
        vnode.attrs.config?.enabled ? 'Enabled' : 'Disabled'
      ),
      m(
        'td',
        { class: 'p-3' },
        m(
          m.route.Link,
          {
            class:
              'font-sans antialiased text-sm text-current font-medium hover:text-primary',
            href: '/config/uaclient/' + vnode.attrs.config?.id,
          },
          'Details'
        )
      ),
    ]),
};

export const ClientConfigTableComponent: m.Component<ClientConfigTableComponentAttrs> =
  {
    view: (vnode: m.Vnode<ClientConfigTableComponentAttrs>) =>
      m('table', { class: 'w-full' }, [
        m(
          'thead',
          {
            class:
              'border-b border-gray-400 bg-gray-400 text-gray-900 text-sm font-medium',
          },
          [
            m('tr', [
              m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Name'),
              m(
                'th',
                { class: 'px-2.5 py-2 text-start font-medium' },
                'Server Uri'
              ),
              m(
                'th',
                { class: 'px-2.5 py-2 text-start font-medium' },
                'Description'
              ),
              m(
                'th',
                { class: 'px-2.5 py-2 text-start font-medium' },
                'Enabled'
              ),
              m(
                'th',
                { class: 'px-2.5 py-2 text-start font-medium' },
                'Details'
              ),
            ]),
          ]
        ),
        m(
          'tbody',
          { class: 'group text-sm' },
          vnode.attrs.configs?.map((config) =>
            m(ConfigTableRowComponent, { config })
          )
        ),
      ]),
  };
