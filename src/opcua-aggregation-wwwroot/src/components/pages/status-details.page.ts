import m from 'mithril';
import { IStatusPageModel } from '../../models/status/status-page.model';
import { MonitoredItemTableComponent } from '../common/status/monitored-item-table.component';
import { ClientStatusDetailsInfoComponent } from '../common/status/client-status-details-info.component';
import { CardComponent } from '../shared/card.component';

export interface IStatusDetailsPage {
  oninit(vnode: { attrs: { id: number } }): Promise<void>;
  view(vnode: { attrs: { id: number } });
}

export class StatusDetailsPage {
  constructor(private statusModel: IStatusPageModel) {}

  async oninit(vnode: { attrs: { id: number } }) {
    await this.statusModel.load(vnode.attrs.id);
  }

  view(vnode: { attrs: { id: number } }) {
    return m('div', [
      m('div', { class: 'flex flex-wrap' }, [
        m(
          CardComponent,
          m(ClientStatusDetailsInfoComponent, {
            status: this.statusModel.current,
          })
        ),
      ]),
      m('div', { class: 'flex flex-col' }, [
        m(
          CardComponent,
          m(MonitoredItemTableComponent, {
            items: this.statusModel.current?.monitoredItems,
          })
        ),
      ]),
    ]);
  }
}
