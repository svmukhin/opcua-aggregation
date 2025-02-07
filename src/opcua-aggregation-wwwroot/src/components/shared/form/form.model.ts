import { FormFieldModel } from './form-field.model';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
}

export class FormModel {
  fields: FormFieldModel[] = [];

  constructor(configs: FormFieldConfig[]) {
    this.fields = configs.map(
      (config) =>
        new FormFieldModel(
          config.name,
          config.label,
          config.type,
          config.placeholder,
          config.required,
          config.validation
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
