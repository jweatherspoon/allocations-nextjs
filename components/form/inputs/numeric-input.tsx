'use client';

import { NumericInputValidations } from '@/models/validations/form-validations';
import { useEffect, useMemo, useState } from 'react';

export default function NumericInput({
  id,
  step,
  label,
  value,
  onChange,
  placeholder,
  validations,
  onError,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (newValue: string, error?: string) => void;
  step?: string;
  placeholder?: string;
  validations?: NumericInputValidations;
  onError?: (error?: string) => void;
}) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  const validationError = useMemo(() => {
    if (hasBeenFocused && validations) {
      // Perform validation logic here
      const parsedValue = Number(value);

      let error: string | undefined = undefined;
      if (
        validations.required &&
        (value === '' ||
          value === null ||
          value === undefined ||
          isNaN(parsedValue))
      ) {
        error = 'This field is required';
      } else if (
        validations.min !== undefined &&
        parsedValue < validations.min
      ) {
        error = `Minimum value is ${validations.min}`;
      } else if (
        validations.max !== undefined &&
        parsedValue > validations.max
      ) {
        error = `Maximum value is ${validations.max}`;
      }

      if (validations.customValidations) {
        for (const validateFn of validations.customValidations) {
          const customError = validateFn(parsedValue);
          if (customError) {
            error = customError;
            break;
          }
        }
      }

      return error;
    }
  }, [value, validations, hasBeenFocused]);

  const handleChange = useMemo(() => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      onError?.(validationError);
      onChange(e.target.value, validationError);
    };
  }, [onChange, validationError, onError]);

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
        onChange={handleChange}
        onBlur={() => setHasBeenFocused(true)}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md border ${
          validationError ? 'border-red-500' : 'border-platinum'
        } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
      />
      {validationError && (
        <p className='text-sm text-red-600 mb-1'>{validationError}</p>
      )}
    </div>
  );
}
