import m from 'mithril';
import { MonitoredItemTableComponent } from '../common/status/monitored-item-table.component';
import { ClientStatusDetailsInfoComponent } from '../common/status/client-status-details-info.component';
import { CardComponent } from '../shared/card.component';
import { IStatusDetailsPageModel } from '../../models/status/status-details-page.model';

export interface IStatusDetailsPage {
  oninit(vnode: { attrs: { id: number } }): Promise<void>;
  view(vnode: { attrs: { id: number } });
}

export class StatusDetailsPage {
  constructor(private _statusDetailsModel: IStatusDetailsPageModel) {}

  async oninit(vnode: { attrs: { id: number } }) {
    await this._statusDetailsModel.load(vnode.attrs.id);
  }

  view(vnode: { attrs: { id: number } }) {
    return m('div', [
      m('div', { class: 'flex flex-wrap' }, [
        m(
          CardComponent,
          m(ClientStatusDetailsInfoComponent, {
            status: this._statusDetailsModel.current,
          })
        ),
      ]),
      m('div', { class: 'flex flex-col' }, [
        m(
          CardComponent,
          m(MonitoredItemTableComponent, {
            items: this._statusDetailsModel.current?.monitoredItems,
          })
        ),
      ]),
    ]);
  }
}
