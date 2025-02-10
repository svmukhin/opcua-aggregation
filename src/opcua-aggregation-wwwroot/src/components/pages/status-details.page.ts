import m from 'mithril';
import { MonitoredItemTableComponent } from '../common/status/monitored-item-table.component';
import { ClientStatusDetailsInfoComponent } from '../common/status/client-status-details-info.component';
import { CardComponent } from '../shared/card.component';
import { container } from '../../utils/di-container';
import { IClientStatusService } from '../../services/client-status.service';
import { UaClientStatus } from '../../models/status/ua-client-status.model';

interface StatusDetailsPageAttrs {
  id: number;
}

export class StatusDetailsPage
  implements m.ClassComponent<StatusDetailsPageAttrs>
{
  private _service: IClientStatusService;
  status: UaClientStatus | undefined;

  constructor() {
    this._service = container.resolve<IClientStatusService>(
      'IClientStatusService'
    );
  }

  async oninit(vnode: m.Vnode<StatusDetailsPageAttrs>) {
    this.status = await this._service.getClientStatus(vnode.attrs.id);
  }

  view(vnode: m.Vnode<StatusDetailsPageAttrs>) {
    return m('div', [
      m('div', { class: 'flex flex-wrap' }, [
        m(
          CardComponent,
          m(ClientStatusDetailsInfoComponent, {
            status: this.status,
          })
        ),
      ]),
      m('div', { class: 'flex flex-col' }, [
        m(
          CardComponent,
          m(MonitoredItemTableComponent, {
            items: this.status?.monitoredItems,
          })
        ),
      ]),
    ]);
  }
}
