import m from 'mithril';
import { MonitoredItemTableComponent } from '../common/status/monitored-item-table.component';
import { ClientStatusDetailsInfoComponent } from '../common/status/client-status-details-info.component';
import { CardComponent } from '../shared/card.component';
import { StatusDetailsPageModel } from '../../models/status/status-details-page.model';
import { container } from '../../utils/di-container';

interface StatusDetailsPageAttrs {
  id: number;
}

export class StatusDetailsPage
  implements m.ClassComponent<StatusDetailsPageAttrs>
{
  private _statusDetailsModel: StatusDetailsPageModel;
  constructor() {
    this._statusDetailsModel = container.resolve<StatusDetailsPageModel>(
      'StatusDetailsPageModel'
    );
  }

  async oninit(vnode: m.Vnode<StatusDetailsPageAttrs>) {
    await this._statusDetailsModel.load(vnode.attrs.id);
  }

  view(vnode: m.Vnode<StatusDetailsPageAttrs>) {
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
