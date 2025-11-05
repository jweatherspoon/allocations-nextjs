'use client';

import { TextInputValidations } from '@/models/validations/form-validations';
import { useMemo, useState } from 'react';

export default function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  validations,
  rows,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (newValue: string, err?: string) => void;
  placeholder?: string;
  validations?: TextInputValidations;
  rows?: number;
}) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  const validationError = useMemo(() => {
    if (hasBeenFocused && validations) {
      // Perform validation logic here
      if (validations.required && value?.trim() === '') {
        return 'This field is required';
      }

      if (validations.minLength && value.length < validations.minLength) {
        return `Minimum length is ${validations.minLength}`;
      }

      if (validations.maxLength && value.length > validations.maxLength) {
        return `Maximum length is ${validations.maxLength}`;
      }

      if (validations.pattern && !validations.pattern.test(value)) {
        return 'Invalid format';
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
      {rows && rows > 1 ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value, validationError)}
          onBlur={() => setHasBeenFocused(true)}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md border ${
            validationError ? 'border-red-500' : 'border-platinum'
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
          onBlur={() => setHasBeenFocused(true)}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md border ${
            validationError ? 'border-red-500' : 'border-platinum'
          } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
        />
      )}
      {validationError && (
        <p className='text-sm text-red-600 mb-1'>{validationError}</p>
      )}
    </div>
  );
}
