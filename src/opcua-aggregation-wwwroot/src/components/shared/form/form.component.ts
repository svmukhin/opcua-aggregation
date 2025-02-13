import m from 'mithril';
import { ButtonComponent } from '../button.component';
import { FormFieldConfig, FormGroupComponent } from './form-group.component';
import { ButtonGroupComponent } from '../button-group.component';

interface FormAttrs {
  configs: FormFieldConfig[];
  onSubmit: (formData: Record<string, string>) => void;
  initialValues?: Record<string, string>;
}

export class FormComponent implements m.ClassComponent<FormAttrs> {
  formGroup: FormGroupComponent;
  attrs: FormAttrs;

  constructor(vnode: m.Vnode<FormAttrs>) {
    this.attrs = vnode.attrs;
    this.formGroup = new FormGroupComponent(
      this.attrs.configs,
      this.attrs.initialValues
    );
  }

  onSubmit = (e: Event) => {
    e.preventDefault();
    if (this.formGroup.validate()) {
      this.attrs.onSubmit(this.formGroup.getFormData());
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
      this.formGroup.fields.map((field) => {
        return m('div', { class: 'mb-4' }, [
          !field.hidden &&
            m('label', { class: 'block text-sm font-bold' }, field.label),
          field.type === 'textarea'
            ? m('textarea', {
                class:
                  'mt-1 block w-full p-2 border border-gray-400 rounded-md',
                placeholder: field.placeholder,
                value: field.value,
                hidden: field.hidden,
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
                hidden: field.hidden,
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
