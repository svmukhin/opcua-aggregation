import m from 'mithril';
import { UaClientChannelConfig } from '../../../models/config/ua-client-channel-config.model';

interface ClientChannelsRowComponentAttrs {
  channel: UaClientChannelConfig;
}

interface ClientChannelsTableComponentAttrs {
  channels: UaClientChannelConfig[];
}

const ClientChannelsRowComponent: m.Component<ClientChannelsRowComponentAttrs> =
  {
    view: (vnode: m.Vnode<ClientChannelsRowComponentAttrs>) =>
      m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
        m('td', { class: 'p-3' }, vnode.attrs.channel.nodeId),
        m('td', { class: 'p-3' }, vnode.attrs.channel.name),
        m('td', { class: 'p-3' }, vnode.attrs.channel.description),
        m('td', { class: 'p-3' }, vnode.attrs.channel.id),
      ]),
  };

export const ClientChannelsTableComponent: m.Component<ClientChannelsTableComponentAttrs> =
  {
    view: (vnode: m.Vnode<ClientChannelsTableComponentAttrs>) =>
      m('table', { class: 'w-full' }, [
        m(
          'thead',
          {
            class:
              'border-b border-gray-400 bg-gray-400 text-gray-900 text-sm font-medium',
          },
          m('tr', [
            m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Node Id'),
            m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Name'),
            m(
              'th',
              { class: 'px-2.5 py-2 text-start font-medium' },
              'Description'
            ),
            m('th', { class: 'px-2.5 py-2 text-start font-medium' }, ''),
          ])
        ),
        m(
          'tbody',
          { class: 'text-sm' },
          vnode.attrs.channels?.map((channel) =>
            m(ClientChannelsRowComponent, { channel })
          )
        ),
      ]),
  };
