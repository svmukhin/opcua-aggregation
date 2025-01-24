import m from 'mithril';
import { utils } from '../../utils/utils';
import { MonitoredItem } from '../../models/monitored-item.model';

export const MonitoredItemComponent = {
  view: (vnode: { attrs: { item: MonitoredItem } }) =>
    m(
      'div',
      { class: 'list-group-item' },
      m('div', { class: 'd-flex w-100' }, [
        m('h6', { class: 'p-2 w-50' }, vnode.attrs.item.tagId),
        m('h6', { class: 'p-2 w-25' }, vnode.attrs.item.aggregationTag.value),
        m(
          'h6',
          { class: 'p-2' },
          utils.formatTimestamp(vnode.attrs.item.aggregationTag.timestamp)
        ),
        m(
          'h6',
          { class: 'p-2' },
          utils.formatStatusCode(vnode.attrs.item.aggregationTag.statusCode)
        ),
      ])
    ),
};
