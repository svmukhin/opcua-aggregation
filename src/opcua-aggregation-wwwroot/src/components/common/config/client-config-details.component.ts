import m from 'mithril';
import { UaClientConfig } from '../../../models/config/ua-client-config.model';

interface ClientConfigDetailsComponentAttrs {
  config: UaClientConfig | undefined;
}

export class ClientConfigDetailsComponent
  implements m.ClassComponent<ClientConfigDetailsComponentAttrs>
{
  view(vnode: m.Vnode<ClientConfigDetailsComponentAttrs>) {
    return m('dl', { class: 'w-sm divide-y divide-gray-400' }, [
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session ID: '),
        m('dd', { class: 'text-lg font-semibold' }, vnode.attrs.config?.id),
      ]),
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session Name: '),
        m(
          'dd',
          { class: 'text-lg font-semibold' },
          vnode.attrs.config?.sessionName
        ),
      ]),
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session URI: '),
        m(
          'dd',
          { class: 'text-lg font-semibold' },
          vnode.attrs.config?.serverUri
        ),
      ]),
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Description: '),
        m(
          'dd',
          { class: 'text-lg font-semibold' },
          vnode.attrs.config?.description
        ),
      ]),
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Enabled: '),
        m(
          'dd',
          { class: 'text-lg font-semibold' },
          vnode.attrs.config?.enabled ? 'Enabled' : 'Disabld'
        ),
      ]),
    ]);
  }
}
