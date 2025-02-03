import m from 'mithril';
import { utils } from '../../../utils/utils';
import { MonitoredItem } from '../../../models/status/monitored-item.model';

interface MonitoredItemRowAttrs {
  item: MonitoredItem;
}

interface MonitoredItemTableAttrs {
  items: MonitoredItem[];
}

const MonitoredItemRowComponent: m.Component<MonitoredItemRowAttrs> = {
  view: (vnode: m.Vnode<MonitoredItemRowAttrs>) =>
    m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
      m('td', { class: 'p-3' }, vnode.attrs.item.tagId),
      m('td', { class: 'p-3' }, vnode.attrs.item.aggregationTag.value),
      m(
        'td',
        { class: 'p-3' },
        utils.formatTimestamp(vnode.attrs.item.aggregationTag.timestamp)
      ),
      m(
        'td',
        { class: 'p-3' },
        utils.formatStatusCode(vnode.attrs.item.aggregationTag.statusCode)
      ),
    ]),
};

export const MonitoredItemTableComponent: m.Component<MonitoredItemTableAttrs> =
  {
    view: (vnode: m.Vnode<MonitoredItemTableAttrs>) =>
      m('table', { class: 'w-full' }, [
        m(
          'thead',
          {
            class:
              'border-b border-gray-400 bg-gray-400 text-gray-900 text-sm font-medium',
          },
          m('tr', [
            m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Node Id'),
            m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Value'),
            m(
              'th',
              { class: 'px-2.5 py-2 text-start font-medium' },
              'Timestamp'
            ),
            m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Quality'),
          ])
        ),
        m(
          'tbody',
          { class: 'group text-sm' },
          vnode.attrs.items?.map((item) => {
            return m(MonitoredItemRowComponent, { item });
          })
        ),
      ]),
  };
