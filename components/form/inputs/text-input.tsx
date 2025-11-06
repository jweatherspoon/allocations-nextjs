'use client';

import { TextInputValidations } from '@/models/validations/form-validations';

export default function TextInput({
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
