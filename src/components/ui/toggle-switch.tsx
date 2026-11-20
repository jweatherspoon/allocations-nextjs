'use client';

/**
 * A settings row: label on the left, switch on the right. The whole row is the button.
 * Pass `className` for row dividers, e.g. `border-b border-line`.
 */
export function ToggleSwitch({
  checked,
  onChange,
  label,
  className = '',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between py-4 text-base font-medium ${className}`}
    >
      <span>{label}</span>
      <span
        aria-hidden='true'
        className={`flex h-[30px] w-[50px] rounded-[15px] p-[3px] transition-colors duration-200 ${
          checked ? 'justify-end bg-accent' : 'justify-start bg-chip'
        }`}
      >
        <span className='h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)]' />
      </span>
    </button>
  );
}
