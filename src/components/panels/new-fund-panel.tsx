'use client';

import type { PanelProps } from '@/components/shell/panel-context';
import { PanelHeader } from '@/components/ui/panel-header';

/** STUB (Phase 0): replaced by the New fund / Settings agent. Keep the export and props. */
export function NewFundPanel({ onClose }: PanelProps<'new'>) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <PanelHeader title='New fund' onClose={onClose} />
      <p className='mt-10 font-serif text-4xl'>New fund</p>
      <p className='mt-2 text-muted'>Coming soon</p>
    </div>
  );
}
