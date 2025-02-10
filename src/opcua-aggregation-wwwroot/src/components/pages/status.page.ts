import m from 'mithril';
import { ClientStatusTableComponent } from '../common/status/client-status-table.component';
import { CardComponent } from '../shared/card.component';
import { container } from '../../utils/di-container';
import { IClientStatusService } from '../../services/client-status.service';
import { UaClientStatus } from '../../models/status/ua-client-status.model';

export class StatusPage implements m.ClassComponent {
  private _service: IClientStatusService;
  statusesList: UaClientStatus[] | undefined;

  constructor() {
    this._service = container.resolve<IClientStatusService>(
      'IClientStatusService'
    );
  }

  async oninit() {
    this.statusesList = await this._service.getClientStatuses();
  }

  view() {
    return m('div', { class: 'flex flex-col' }, [
      m(
        CardComponent,
        m(ClientStatusTableComponent, {
          statuses: this.statusesList,
        })
      ),
    ]);
  }
}
