'use client';

import { money, moneyAuto } from '@/lib/pace/format';
import type { FundView } from '@/lib/pace/pace';

/** One fund in the split list: name, value, slider and an "effect" line. */
export function AllocationRow({
  fund,
  value,
  max,
  onChange,
}: {
  fund: FundView;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const p = fund.pace;
  const after =
    p && p.status !== 'Funded'
      ? Math.min(100, Math.round((value / p.need) * 100))
      : null;
  const effect =
    after === null
      ? p
        ? 'Already funded'
        : 'Pot · no deadline'
      : after >= 100
        ? 'Covers this month — stays on pace'
        : `${after}% of this month's ${money(p!.need)}`;
  const color =
    after !== null && after >= 100 ? 'var(--good)' : 'var(--muted)';

  return (
    <div className='border-b border-line py-3'>
      <div className='flex items-baseline justify-between'>
        <span className='text-[15px] font-semibold'>{fund.name}</span>
        <span className='font-mono text-base font-semibold'>
          {moneyAuto(value)}
        </span>
      </div>
      <input
        type='range'
        min={0}
        max={max}
        step={5}
        value={value}
        aria-label={fund.name}
        onChange={(e) => onChange(+e.target.value)}
        className='my-1 w-full'
      />
      <div className='text-xs' style={{ color }}>
        {effect}
      </div>
    </div>
  );
}
