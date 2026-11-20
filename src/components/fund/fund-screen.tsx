'use client';

import Link from 'next/link';

import { usePortfolio } from '@/components/shell/portfolio-context';

/** STUB (Phase 0): replaced by the Fund detail agent. Keep the `FundScreen({ fundId })` export. */
export function FundScreen({ fundId }: { fundId: string }) {
  const { active, archived } = usePortfolio();
  const view = [...active, ...archived].find((f) => f.id === fundId);

  return (
    <main className='px-[18px] pt-[62px] pb-32'>
      <Link href='/' className='text-sm text-muted'>
        ← Back
      </Link>
      <h1 className='mt-4 font-serif text-4xl leading-none'>
        {view?.name ?? 'Unknown fund'}
      </h1>
      <p className='mt-2 text-muted'>Coming soon</p>
    </main>
  );
}
