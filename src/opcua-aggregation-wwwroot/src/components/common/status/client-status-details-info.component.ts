import m from 'mithril';
import { UaClientStatus } from '../../../models/status/ua-client-status.model';

export const ClientStatusDetailsInfoComponent = {
  view: (vnode: { attrs: { status: UaClientStatus } }) =>
    m('dl', { class: 'max-w-md divide-y divide-gray-400' }, [
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session ID: '),
        m('dd', { class: 'text-lg font-semibold' }, vnode.attrs.status?.id),
      ]),
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session Name: '),
        m(
          'dd',
          { class: 'text-lg font-semibold' },
          vnode.attrs.status?.sessionName
        ),
      ]),
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session URI: '),
        m(
          'dd',
          { class: 'text-lg font-semibold' },
          vnode.attrs.status?.serverUri
        ),
      ]),
      m('div', { class: 'flex flex-col pb-3' }, [
        m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Connect Error: '),
        m(
          'dd',
          { class: 'text-lg font-semibold' },
          vnode.attrs.status?.connectError
        ),
      ]),
    ]),
};
