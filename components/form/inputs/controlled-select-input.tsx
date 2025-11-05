'use client';

import { useController, Control, FieldValues, Path } from 'react-hook-form';
import SelectInput from './select-input';
import { SelectInputValidations } from '@/models/validations/form-validations';

interface ControlledSelectInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  validations?: SelectInputValidations;
}

export function ControlledSelectInput<T extends FieldValues>({
  name,
  control,
  validations,
  ...props
}: ControlledSelectInputProps<T>) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules: {
      required: validations?.required ? 'This field is required' : undefined,
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
    <SelectInput
      {...props}
      value={value || ''}
      onChange={(val) => {
        onChange(val);
      }}
      validations={validations}
    />
  );
}
