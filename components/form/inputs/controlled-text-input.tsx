'use client';

import { useController, Control, FieldValues, Path } from 'react-hook-form';
import TextInput from './text-input';
import { TextInputValidations } from '@/models/validations/form-validations';

interface ControlledTextInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  id: string;
  placeholder?: string;
  rows?: number;
  validations?: TextInputValidations;
}

export function ControlledTextInput<T extends FieldValues>({
  name,
  control,
  validations,
  ...props
}: ControlledTextInputProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: validations?.required ? 'This field is required' : undefined,
      minLength: validations?.minLength
        ? {
            value: validations.minLength,
            message: `Minimum length is ${validations.minLength}`,
          }
        : undefined,
      maxLength: validations?.maxLength
        ? {
            value: validations.maxLength,
            message: `Maximum length is ${validations.maxLength}`,
          }
        : undefined,
      pattern: validations?.pattern
        ? {
            value: validations.pattern,
            message: 'Invalid format',
          }
        : undefined,
      validate: validations?.customValidations?.reduce((acc, fn, idx) => {
        acc[`custom${idx}`] = (val: string) => {
          const result = fn(val);
          return result || true;
        };
        return acc;
      }, {} as Record<string, (val: string) => string | boolean>),
    },
  });

  return (
    <TextInput
      {...props}
      value={value || ''}
      onChange={(val) => {
        onChange(val);
      }}
      validations={validations}
      error={error?.message}
    />
  );
}
