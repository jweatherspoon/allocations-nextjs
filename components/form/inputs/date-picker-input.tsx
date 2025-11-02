'use client';

import { useMemo, useState } from 'react';
import { DatePickerInputValidations } from '@/models/validations/form-validations';

export default function DatePickerInput({
  id,
  label,
  value,
  onChange,
  validations,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (newDate: string) => void;
  validations?: DatePickerInputValidations;
}) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const validationError = useMemo(() => {
    if (hasBeenFocused && validations) {
      // Perform validation logic here
      if (validations.required && !value) {
        return 'This field is required';
      }
      
      const parsedDate = new Date(Date.parse(value));

      if (validations.minDate && parsedDate && parsedDate < validations.minDate) {
        return `Date cannot be before ${validations.minDate.toLocaleDateString()}`;
      }

      if (validations.maxDate && parsedDate && parsedDate > validations.maxDate) {
        return `Date cannot be after ${validations.maxDate.toLocaleDateString()}`;
      }

      if (validations.customValidations) {
        for (const validateFn of validations.customValidations) {
          const error = validateFn(parsedDate);
          if (error) {
            return error;
          }
        }
      }
    }
  }, [value, validations, hasBeenFocused]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-dusk">
        {label}
      </label>
      <input
        type="date"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setHasBeenFocused(true)}
        className={`mt-1 block w-full rounded-md border ${
          validationError ? 'border-red-500' : 'border-platinum'
        } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
      />
      {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
    </div>
  );
}
