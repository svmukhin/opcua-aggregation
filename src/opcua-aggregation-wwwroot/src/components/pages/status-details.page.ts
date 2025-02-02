import m from 'mithril';
import { MonitoredItemTableComponent } from '../common/status/monitored-item-table.component';
import { ClientStatusDetailsInfoComponent } from '../common/status/client-status-details-info.component';
import { CardComponent } from '../shared/card.component';
import { IStatusDetailsPageModel } from '../../models/status/status-details-page.model';

interface IStatusDetailsPageAttrs {
  id: number;
}

export class StatusDetailsPage
  implements m.ClassComponent<IStatusDetailsPageAttrs>
{
  constructor(private _statusDetailsModel: IStatusDetailsPageModel) {}

  async oninit(vnode: m.Vnode<IStatusDetailsPageAttrs>) {
    await this._statusDetailsModel.load(vnode.attrs.id);
  }

  view(vnode: m.Vnode<IStatusDetailsPageAttrs>) {
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
