import m from 'mithril';
import { IConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigTableComponent } from '../common/config/client-config-table.component';
import { ButtonGroupComponent } from '../shared/button-group.component';
import { ButtonComponent } from '../shared/button.component';
import { ModalComponent } from '../shared/modal.component';

export class ConfigPage implements m.ClassComponent {
  isModalOpen = false;

  constructor(private configModel: IConfigPageModel) {}

  async oninit() {
    await this.configModel.load();
  }

  toggleModal = () => {
    this.isModalOpen = !this.isModalOpen;
    m.redraw();
  };

  view() {
    return m('div', { class: 'flex flex-col' }, [
      m(ButtonGroupComponent, [
        m(ButtonComponent, { onclick: this.toggleModal }, 'Add client'),
      ]),
      m(
        CardComponent,
        m(ClientConfigTableComponent, { configs: this.configModel.list })
      ),
      m(
        ModalComponent,
        {
          isOpen: this.isModalOpen,
          onClose: this.toggleModal,
        },
        [
          m('div', 'Modal Title'),
          m('div', 'Modal Content'),
          m(ButtonComponent, { onclick: this.toggleModal }, 'Close'),
        ]
      ),
    ]);
  }
}
