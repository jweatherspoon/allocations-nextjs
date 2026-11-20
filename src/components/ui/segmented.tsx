'use client';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Optional second line (makes the control taller, as in the New fund panel). */
  sub?: string;
}

/** Pill-style segmented control, e.g. Deposit / Withdraw or Goal / Pot. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const tall = options.some((o) => o.sub);
  return (
    <div
      role='group'
      aria-label={ariaLabel}
      className={`flex gap-1 rounded-[14px] bg-chip p-1 ${className}`}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type='button'
            aria-pressed={selected}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-[10px] text-center ${
              tall ? 'h-11' : 'h-[38px]'
            } ${selected ? 'bg-surface shadow-[0_1px_4px_rgba(0,0,0,.1)]' : ''}`}
          >
            <span className='block text-sm font-semibold'>{o.label}</span>
            {o.sub && (
              <span className='block text-[11px] font-normal text-muted'>
                {o.sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
