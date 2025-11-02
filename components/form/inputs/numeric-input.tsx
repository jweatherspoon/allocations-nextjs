'use client';

import { NumericInputValidations } from '@/models/validations/form-validations';
import { useMemo, useState } from 'react';

export default function NumericInput({
  id,
  step,
  label,
  value,
  onChange,
  placeholder,
  validations,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  step?: string;
  placeholder?: string;
  validations?: NumericInputValidations;
}) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  const validationError = useMemo(() => {
    if (hasBeenFocused && validations) {
      // Perform validation logic here
      const parsedValue = Number(value);
      
      if (validations.required && (value === '' || value === null || value === undefined || isNaN(parsedValue))) {
        return 'This field is required';
      }

      if (validations.min !== undefined && parsedValue < validations.min) {
        return `Minimum value is ${validations.min}`;
      }

      if (validations.max !== undefined && parsedValue > validations.max) {
        return `Maximum value is ${validations.max}`;
      }

      if (validations.customValidations) {
        for (const validateFn of validations.customValidations) {
          const error = validateFn(parsedValue);
          if (error) {
            return error;
          }
        }
      }
    }
  }, [value, validations, hasBeenFocused]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-dusk mb-1">
        {label}
        {validations?.required && <span className="text-red-500">&nbsp;*</span>}
      </label>
      <input
        id={id}
        type="number"
        aria-label={label}
        value={value}
        step={step || 'any'}
        min={validations?.min}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setHasBeenFocused(true)}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md border ${validationError ? 'border-red-500' : 'border-platinum'} px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
      />
      {validationError && (
        <p className="text-sm text-red-600 mb-1">{validationError}</p>
      )}
    </div>
  );
}