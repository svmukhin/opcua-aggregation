import m from 'mithril';
import { utils } from '../../utils/utils';
import { MonitoredItem } from '../../models/monitored-item.model';

export const MonitoredItemComponent = {
  view: ({ attrs: { item } }: { attrs: { item: MonitoredItem } }) =>
    m(
      'div',
      { class: 'list-group-item' },
      m('div', { class: 'd-flex w-100' }, [
        m('h6', { class: 'p-2 w-50' }, item.tagId),
        m('h6', { class: 'p-2 w-25' }, item.aggregationTag.value),
        m(
          'h6',
          { class: 'p-2' },
          utils.formatTimestamp(item.aggregationTag.timestamp)
        ),
        m(
          'h6',
          { class: 'p-2' },
          utils.formatStatusCode(item.aggregationTag.statusCode)
        ),
      ])
    ),
};
