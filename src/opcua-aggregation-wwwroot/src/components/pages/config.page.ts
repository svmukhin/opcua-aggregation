import m from 'mithril';
import { IConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigTableComponent } from '../common/config/client-config-table.component';
import { ButtonComponent } from '../shared/button.component';
import { ButtonGroupComponent } from '../shared/button-group.component';

export class ConfigPage implements m.ClassComponent {
  constructor(private configModel: IConfigPageModel) {}

  async oninit() {
    await this.configModel.load();
  }

  view() {
    return m('div', { class: 'flex flex-col' }, [
      m(ButtonGroupComponent, [
        m(ButtonComponent, { onclick: () => alert('clicked') }, 'Add client'),
      ]),
      m(
        CardComponent,
        m(ClientConfigTableComponent, { configs: this.configModel.list })
      ),
    ]);
  }
}
