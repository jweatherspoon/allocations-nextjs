'use client';

import Link from 'next/link';

import { usePanels } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';

/** STUB (Phase 0): replaced by the Home agent. Keep the `HomeScreen` export. */
export function HomeScreen() {
  const { monthName, active } = usePortfolio();
  const { open } = usePanels();

  return (
    <main className='px-[18px] pt-[62px] pb-32'>
      <h1 className='font-serif text-4xl leading-none'>{monthName}</h1>
      <p className='mt-2 text-muted'>Coming soon</p>

      {/* Temporary dev links so every route and panel is reachable until Phase 1 lands. */}
      <ul className='mt-6 flex flex-col gap-2'>
        {active.map((f) => (
          <li key={f.id}>
            <Link
              href={`/funds/${f.id}`}
              className='block rounded-2xl border border-line bg-surface px-4 py-3'
            >
              {f.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className='mt-4 flex gap-2 font-mono text-xs text-muted'>
        <button type='button' onClick={() => open({ kind: 'split' })}>
          [split]
        </button>
        <button type='button' onClick={() => open({ kind: 'new' })}>
          [new]
        </button>
        <button type='button' onClick={() => open({ kind: 'settings' })}>
          [settings]
        </button>
      </div>
    </main>
  );
}
