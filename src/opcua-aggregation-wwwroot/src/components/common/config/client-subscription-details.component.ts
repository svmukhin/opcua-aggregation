import m from 'mithril';
import { UaClientConfig } from '../../../models/config/ua-client-config.model';

interface ClientSubscriptionDetailsComponentAttrs {
  config: UaClientConfig;
}

export const ClientSubscriptionDetailsComponent: m.Component<ClientSubscriptionDetailsComponentAttrs> =
  {
    view: (vnode: m.Vnode<ClientSubscriptionDetailsComponentAttrs>) =>
      m('dl', { class: 'w-sm divide-y divide-gray-400' }, [
        m('div', { class: 'flex flex-col pb-3' }, [
          m(
            'dt',
            { class: 'mb-1 text-lg text-gray-400' },
            'Keep Alive Interval: '
          ),
          m(
            'dd',
            { class: 'text-lg font-semibold' },
            vnode.attrs.config?.keepAliveInterval
          ),
        ]),
        m('div', { class: 'flex flex-col pb-3' }, [
          m(
            'dt',
            { class: 'mb-1 text-lg text-gray-400' },
            'Reconnect Period: '
          ),
          m(
            'dd',
            { class: 'text-lg font-semibold' },
            vnode.attrs.config?.reconnectPeriod
          ),
        ]),
        m('div', { class: 'flex flex-col pb-3' }, [
          m(
            'dt',
            { class: 'mb-1 text-lg text-gray-400' },
            'Session Lifetime: '
          ),
          m(
            'dd',
            { class: 'text-lg font-semibold' },
            vnode.attrs.config?.sessionLifetime
          ),
        ]),
      ]),
  };
