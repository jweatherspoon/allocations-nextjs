'use client';

import { DatePickerInputValidations } from '@/models/validations/form-validations';

export default function DatePickerInput({
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
