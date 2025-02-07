import m from 'mithril';

export interface FormField {
  type: 'text' | 'password' | 'email' | 'number' | 'textarea';
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  validate?: (value: string) => string | null;
}

interface DynamicFormAttrs {
  fields: FormField[];
}

export class DynamicFormComponent
  implements m.ClassComponent<DynamicFormAttrs>
{
  view() {}
}
