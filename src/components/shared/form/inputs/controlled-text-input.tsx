'use client';

import { useController, Control, FieldValues, Path } from 'react-hook-form';
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

function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  validations,
  rows,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  validations?: TextInputValidations;
  rows?: number;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-dusk mb-1'>
        {label}
        {validations?.required && <span className='text-red-500'>&nbsp;*</span>}
      </label>
      {rows && rows > 1 ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md border ${
            error ? 'border-red-500' : 'border-platinum'
          } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type='text'
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md border ${
            error ? 'border-red-500' : 'border-platinum'
          } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
        />
      )}
      {error && <p className='text-sm text-red-600 mb-1'>{error}</p>}
    </div>
  );
}
