'use client';

import { useController, Control, FieldValues, Path } from 'react-hook-form';
import NumericInput from './numeric-input';
import { NumericInputValidations } from '@/models/validations/form-validations';

interface ControlledNumericInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  id: string;
  placeholder?: string;
  step?: string;
  validations?: NumericInputValidations;
}

export function ControlledNumericInput<T extends FieldValues>({
  name,
  control,
  validations,
  ...props
}: ControlledNumericInputProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: validations?.required ? 'This field is required' : undefined,
      min: validations?.min
        ? {
            value: validations.min,
            message: `Minimum value is ${validations.min}`,
          }
        : undefined,
      max: validations?.max
        ? {
            value: validations.max,
            message: `Maximum value is ${validations.max}`,
          }
        : undefined,
      validate: validations?.customValidations?.reduce((acc, fn, idx) => {
        acc[`custom${idx}`] = (val: number) => {
          const result = fn(val);
          return result || true;
        };
        return acc;
      }, {} as Record<string, (val: number) => string | boolean>),
    },
  });

  return (
    <NumericInput
      {...props}
      value={value || ''}
      onChange={onChange}
      validations={validations}
      error={error?.message}
    />
  );
}
