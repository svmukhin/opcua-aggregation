import m from 'mithril';
import { CardComponent } from '../shared/card.component';
import { ClientConfigTableComponent } from '../common/config/client-config-table.component';
import { ButtonGroupComponent } from '../shared/button-group.component';
import { ButtonComponent } from '../shared/button.component';
import { FormFieldConfig } from '../shared/form/form-group.component';
import { container } from '../../utils/di-container';
import { IClientConfigService } from '../../services/client-config.service';
import { UaClientConfig } from '../../models/config/ua-client-config.model';
import { ConfigEditModalComponent } from '../common/config/config-edit-modal.component';

export const formFieldConfigs: FormFieldConfig[] = [
  {
    name: 'id',
    label: 'ID',
    type: 'text',
    hidden: true,
  },
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
  selectedConfig: UaClientConfig | undefined;

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

  addOrUpdateClient = async (config: UaClientConfig) => {
    if (config.id) {
      await this._service.updateClient(config);
      return;
    }
    const client = await this._service.createClient(config);
    this.clientConfigs?.push(client);
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
      this.isModalOpen &&
        m(ConfigEditModalComponent, {
          formFieldConfigs,
          config: this.selectedConfig || new UaClientConfig({}),
          onSubmit: this.addOrUpdateClient,
          onClose: this.toggleModal,
        }),
    ]);
  }
}
