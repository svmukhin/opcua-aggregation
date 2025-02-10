import m from 'mithril';
import { StatusPageModel } from '../../models/status/status-page.model';
import { ClientStatusTableComponent } from '../common/status/client-status-table.component';
import { CardComponent } from '../shared/card.component';
import { container } from '../../utils/di-container';

export class StatusPage implements m.ClassComponent {
  statusModel: StatusPageModel;

  constructor() {
    this.statusModel = container.resolve('StatusPageModel');
  }

  async oninit() {
    await this.statusModel.load();
  }

  view() {
    return m('div', { class: 'flex flex-col' }, [
      m(
        CardComponent,
        m(ClientStatusTableComponent, {
          statuses: this.statusModel.list,
        })
      ),
    ]);
  }
}
