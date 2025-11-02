export interface TextInputValidations {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidations?: ((value: string) => string | null)[];
}

export interface NumericInputValidations {
  required?: boolean;
  min?: number;
  max?: number;
  customValidations?: ((value: number) => string | null)[];
}

export interface DatePickerInputValidations {
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  customValidations?: ((value: Date) => string | null)[];
}
