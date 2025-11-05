'use client';

import { SelectInputValidations } from '@/models/validations/form-validations';
import { useMemo, useState } from 'react';

export default function SelectInput({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  validations,
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string, err?: string) => void;
  placeholder?: string;
  validations?: SelectInputValidations;
}) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  const validationError = useMemo(() => {
    if (hasBeenFocused && validations) {
      if (validations.required && !value) {
        return 'This field is required';
      }

      if (validations.customValidations) {
        for (const validateFn of validations.customValidations) {
          const error = validateFn(value);
          if (error) {
            return error;
          }
        }
      }
    }
  }, [value, validations, hasBeenFocused]);

  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-dusk mb-1'>
        {label}
        {validations?.required && <span className='text-red-500'>&nbsp;*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value, validationError)}
        onBlur={() => setHasBeenFocused(true)}
        className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm ${
          validationError ? 'border-red-500' : 'border-platinum'
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
      {validationError && (
        <p className='mt-1 text-sm text-red-500'>{validationError}</p>
      )}
    </div>
  );
}
