import m from 'mithril';
import { ButtonComponent } from '../button.component';
import { FormFieldConfig, FormModel } from './form.model';
import { ButtonGroupComponent } from '../button-group.component';

interface FormAttrs {
  configs: FormFieldConfig[];
  onSubmit: (formData: Record<string, string>) => void;
}

export class FormComponent implements m.ClassComponent<FormAttrs> {
  formModel: FormModel;
  attrs: FormAttrs;

  constructor(vnode: m.Vnode<FormAttrs>) {
    this.attrs = vnode.attrs;
    this.formModel = new FormModel(this.attrs.configs);
  }

  onSubmit = (e: Event) => {
    e.preventDefault();
    if (this.formModel.validate()) {
      this.attrs.onSubmit(this.formModel.getFormData());
    } else {
      m.redraw();
    }
  };

  view(vnode: m.Vnode<FormAttrs, this>): m.Children | null | void {
    return m(
      'form',
      {
        onsubmit: this.onSubmit,
        class: 'max-w-md mx-auto p-2 rounded-lg',
      },
      this.formModel.fields.map((field) => {
        return m('div', { class: 'mb-4' }, [
          m('label', { class: 'block text-sm font-bold' }, field.label),
          field.type === 'textarea'
            ? m('textarea', {
                class:
                  'mt-1 block w-full p-2 border border-gray-400 rounded-md',
                placeholder: field.placeholder,
                value: field.value,
                oninput: (e: InputEvent) => {
                  field.setValue((e.target as HTMLTextAreaElement).value);
                },
              })
            : m('input', {
                class:
                  'form-input mt-1 p-2 block w-full border border-gray-400 rounded-md',
                type: field.type,
                placeholder: field.placeholder,
                value: field.value,
                oninput: (e: InputEvent) => {
                  field.setValue((e.target as HTMLInputElement).value);
                },
              }),
          field.error &&
            m('p', { class: 'text-red-500 text-xs italic' }, field.error),
        ]);
      }),
      m(ButtonGroupComponent, [
        m(ButtonComponent, { type: 'submit', label: 'Submit' }),
      ])
    );
  }
}
