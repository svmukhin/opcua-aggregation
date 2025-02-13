import m from 'mithril';
import { FormComponent } from '../../shared/form/form.component';
import { ModalComponent } from '../../shared/modal.component';
import { UaClientConfig } from '../../../models/config/ua-client-config.model';
import { FormFieldConfig } from '../../shared/form/form-group.component';

interface ConfigEditModalAttrs {
  formFieldConfigs: FormFieldConfig[];
  config: UaClientConfig;
  onSubmit: (updatedConfig: UaClientConfig) => void;
  onClose: () => void;
}

export class ConfigEditModalComponent
  implements m.ClassComponent<ConfigEditModalAttrs>
{
  private attrs: ConfigEditModalAttrs;

  constructor(vnode: m.Vnode<ConfigEditModalAttrs>) {
    this.attrs = vnode.attrs;
  }

  handleSubmit = (formData: Record<string, string>) => {
    this.attrs.onSubmit({
      ...this.attrs.config,
      id: formData.id ? Number(formData.id) : undefined,
      sessionName: formData.sessionName,
      serverUri: formData.serverUri,
      description: formData.description,
    });
    this.attrs.onClose();
  };

  view(vnode: m.Vnode<ConfigEditModalAttrs, this>): m.Children | null | void {
    return m(ModalComponent, { onClose: vnode.attrs.onClose }, [
      m(FormComponent, {
        onSubmit: this.handleSubmit,
        configs: vnode.attrs.formFieldConfigs,
      }),
    ]);
  }
}
