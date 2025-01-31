import m from 'mithril';
import { IConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigTableComponent } from '../common/config/client-config-table.component';

export interface IConfigPage {
  oninit(): Promise<void>;
  view();
}

export class ConfigPage {
  constructor(private configModel: IConfigPageModel) {}

  async oninit() {
    await this.configModel.init();
  }

  view() {
    return m('div', { class: 'flex flex-col' }, [
      m(
        CardComponent,
        m(ClientConfigTableComponent, { configs: this.configModel.list })
      ),
    ]);
  }
}
