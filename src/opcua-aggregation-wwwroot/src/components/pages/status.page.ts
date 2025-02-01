import m from 'mithril';
import { IStatusPageModel } from '../../models/status/status-page.model';
import { ClientStatusTableComponent } from '../common/status/client-status-table.component';
import { CardComponent } from '../shared/card.component';

export interface IStatusPage {
  oninit(): Promise<void>;
  view();
}

export class StatusPage implements IStatusPage {
  constructor(private statusModel: IStatusPageModel) {}

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
