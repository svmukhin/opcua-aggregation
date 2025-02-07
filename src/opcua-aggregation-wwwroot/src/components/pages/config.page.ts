import m from 'mithril';
import { IConfigPageModel } from '../../models/config/config-page.model';
import { CardComponent } from '../shared/card.component';
import { ClientConfigTableComponent } from '../common/config/client-config-table.component';
import { ButtonGroupComponent } from '../shared/button-group.component';
import { ButtonComponent } from '../shared/button.component';
import { ModalComponent } from '../shared/modal.component';
import { FormComponent } from '../shared/form/form.component';
import { FormFieldConfig } from '../shared/form/form.model';

const formFiledConfigs: FormFieldConfig[] = [
  {
    name: 'sessionName',
    label: 'Session Name',
    type: 'text',
    placeholder: 'Session name',
    required: true,
  },
  {
    name: 'sessionUri',
    label: 'Session URI',
    type: 'text',
    placeholder: 'Session URI',
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'Description',
    required: true,
  },
  {
    name: 'keepAliveInterval',
    label: 'Keep Alive Interval',
    type: 'number',
    placeholder: 'Keep Alive Interval',
    required: true,
  },
];

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

  addClient = async (formData: Record<string, string>) => {
    alert('Add client');
    this.toggleModal();
  };

  view() {
    return m('div', { class: 'flex flex-col' }, [
      m(ButtonGroupComponent, [
        m(ButtonComponent, { onclick: this.toggleModal, label: 'Add Client' }),
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
          m(FormComponent, {
            onSubmit: this.addClient,
            configs: formFiledConfigs,
          }),
        ]
      ),
    ]);
  }
}
