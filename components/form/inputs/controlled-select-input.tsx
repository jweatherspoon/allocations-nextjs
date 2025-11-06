'use client';

import { useController, Control, FieldValues, Path } from 'react-hook-form';
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
    fieldState: { error },
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
      error={error?.message}
    />
  );
}

function SelectInput({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  validations,
  error,
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  validations?: SelectInputValidations;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-dusk mb-1'>
        {label}
        {validations?.required && <span className='text-red-500'>&nbsp;*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm ${
          error ? 'border-red-500' : 'border-platinum'
        } focus:border-flame focus:ring-1 focus:ring-flame`}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  );
}
