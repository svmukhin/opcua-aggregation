import { FormControlComponent } from './form-control.component';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number' | 'textarea';
  placeholder?: string;
  hidden?: boolean;
  required?: boolean;
  validation?: (value: string) => string | null;
}

export class FormGroupComponent {
  fields: FormControlComponent[] = [];

  constructor(
    configs: FormFieldConfig[],
    initialValues?: Record<string, string>
  ) {
    this.fields = configs.map(
      (config) =>
        new FormControlComponent(
          config.name,
          config.label,
          config.type,
          config.placeholder,
          config.required,
          config.validation,
          config.hidden,
          initialValues ? initialValues[config.name] : ''
        )
    );
  }

  validate(): boolean {
    return this.fields.every((field) => field.validate());
  }

  getFormData(): Record<string, string> {
    return this.fields.reduce((data, field) => {
      data[field.name] = field.value;
      return data;
    }, {} as Record<string, string>);
  }

  isValid(): boolean {
    return this.fields.every((field) => field.isValid());
  }
}
