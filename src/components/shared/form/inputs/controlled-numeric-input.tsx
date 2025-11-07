'use client';

import { useController, Control, FieldValues, Path } from 'react-hook-form';

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

function NumericInput({
  id,
  step,
  label,
  value,
  onChange,
  placeholder,
  validations,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  step?: string;
  placeholder?: string;
  validations?: NumericInputValidations;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-dusk mb-1'>
        {label}
        {validations?.required && <span className='text-red-500'>&nbsp;*</span>}
      </label>
      <input
        id={id}
        type='number'
        aria-label={label}
        value={value}
        step={step || 'any'}
        min={validations?.min}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md border ${
          error ? 'border-red-500' : 'border-platinum'
        } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
      />
      {error && <p className='text-sm text-red-600 mb-1'>{error}</p>}
    </div>
  );
}
