import m from 'mithril';
import { utils } from '../../utils/utils';
import { MonitoredItem } from '../../models/monitored-item.model';

export const MonitoredItemComponent = {
  view: (vnode: { attrs: { item: MonitoredItem } }) =>
    m(
      'li',
      { class: 'flex items-center py-1.5 px-2.5 rounded-md' },
      m('div', { class: 'w-full flex flex-row justify-between' }, [
        m('div', { class: 'text-xl' }, vnode.attrs.item.tagId),
        m('div', { class: 'text-xl' }, vnode.attrs.item.aggregationTag.value),
        m(
          'div',
          { class: 'text-xl' },
          utils.formatTimestamp(vnode.attrs.item.aggregationTag.timestamp)
        ),
        m(
          'div',
          { class: 'text-xl' },
          utils.formatStatusCode(vnode.attrs.item.aggregationTag.statusCode)
        ),
      ])
    ),
};
