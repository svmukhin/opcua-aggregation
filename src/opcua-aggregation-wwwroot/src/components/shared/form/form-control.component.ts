export class FormControlComponent {
  value: string;
  error: string = '';
  isTouched: boolean = false;

  constructor(
    public name: string,
    public label: string,
    public type: 'text' | 'password' | 'email' | 'number' | 'textarea',
    public placeholder?: string,
    public required?: boolean,
    public validation?: (value: string) => string | null,
    public hidden: boolean = false,
    public initialValue: string = ''
  ) {
    this.value = initialValue;
  }

  setValue(value: string) {
    this.value = value;
    this.isTouched = true;
    this.validate();
  }

  validate(): boolean {
    if (this.required && !this.value) {
      this.error = 'This field is required.';
      return false;
    }

    if (this.validation) {
      const validationError = this.validation(this.value);
      if (validationError) {
        this.error = validationError;
        return false;
      }
    }

    this.error = '';
    return true;
  }

  isValid(): boolean {
    return !this.error;
  }
}
