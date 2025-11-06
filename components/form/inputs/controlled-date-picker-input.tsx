'use client';

import { useController, Control, FieldValues, Path } from 'react-hook-form';
import { DatePickerInputValidations } from '@/models/validations/form-validations';

interface ControlledDatePickerInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  id: string;
  validations?: DatePickerInputValidations;
}

export function ControlledDatePickerInput<T extends FieldValues>({
  name,
  control,
  validations,
  ...props
}: ControlledDatePickerInputProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: validations?.required ? 'This field is required' : undefined,
      validate: {
        ...(validations?.minDate && {
          minDate: (val: string) => {
            if (!val) return true;
            const parsedDate = new Date(Date.parse(val));
            return (
              parsedDate >= validations.minDate! ||
              `Date cannot be before ${validations.minDate!.toLocaleDateString()}`
            );
          },
        }),
        ...(validations?.maxDate && {
          maxDate: (val: string) => {
            if (!val) return true;
            const parsedDate = new Date(Date.parse(val));
            return (
              parsedDate <= validations.maxDate! ||
              `Date cannot be after ${validations.maxDate!.toLocaleDateString()}`
            );
          },
        }),
        ...validations?.customValidations?.reduce((acc, fn, idx) => {
          acc[`custom${idx}`] = (val: string) => {
            if (!val) return true;
            const parsedDate = new Date(Date.parse(val));
            const result = fn(parsedDate);
            return result || true;
          };
          return acc;
        }, {} as Record<string, (val: string) => string | boolean>),
      },
    },
  });

  return (
    <DatePickerInput
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

function DatePickerInput({
  id,
  label,
  value,
  onChange,
  validations,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (newDate: string) => void;
  validations?: DatePickerInputValidations;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-dusk'>
        {label}
        {validations?.required && <span className='text-red-500'>&nbsp;*</span>}
      </label>
      <input
        type='date'
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full rounded-md border ${
          error ? 'border-red-500' : 'border-platinum'
        } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
      />
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  );
}
