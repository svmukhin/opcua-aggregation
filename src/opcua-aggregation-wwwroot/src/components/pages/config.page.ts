import m from 'mithril';
import { CardComponent } from '../shared/card.component';
import { ClientConfigTableComponent } from '../common/config/client-config-table.component';
import { ButtonGroupComponent } from '../shared/button-group.component';
import { ButtonComponent } from '../shared/button.component';
import { ModalComponent } from '../shared/modal.component';
import { FormComponent } from '../shared/form/form.component';
import { FormFieldConfig } from '../shared/form/form.model';
import { container } from '../../utils/di-container';
import { IClientConfigService } from '../../services/client-config.service';
import { UaClientConfig } from '../../models/config/ua-client-config.model';

const formFiledConfigs: FormFieldConfig[] = [
  {
    name: 'sessionName',
    label: 'Session Name',
    type: 'text',
    placeholder: 'Session name',
    required: true,
  },
  {
    name: 'serverUri',
    label: 'Server URI',
    type: 'text',
    placeholder: 'Server URI',
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'Description',
    required: true,
  },
];

export class ConfigPage implements m.ClassComponent {
  isModalOpen = false;

  private _service: IClientConfigService;
  clientConfigs: UaClientConfig[] | undefined;

  constructor() {
    this._service = container.resolve<IClientConfigService>(
      'IClientConfigService'
    );
  }

  async oninit() {
    this.clientConfigs = await this._service.getClientConfigs();
  }

  toggleModal = () => {
    this.isModalOpen = !this.isModalOpen;
    m.redraw();
  };

  addClient = async (formData: Record<string, string>) => {
    const client = await this._service.addClient({
      sessionName: formData.sessionName,
      serverUri: formData.serverUri,
      description: formData.description,
    });
    this.clientConfigs.push(client);
    this.toggleModal();
  };

  view() {
    return m('div', { class: 'flex flex-col' }, [
      m(ButtonGroupComponent, [
        m(ButtonComponent, { onclick: this.toggleModal, label: 'Add Client' }),
      ]),
      m(
        CardComponent,
        m(ClientConfigTableComponent, { configs: this.clientConfigs })
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
