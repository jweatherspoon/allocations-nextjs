'use client';

import type { PanelProps } from '@/components/shell/panel-context';
import { PanelHeader } from '@/components/ui/panel-header';

/** STUB (Phase 0): replaced by the Quick log / Smart split agent. Keep the export and props. */
export function SmartSplitPanel({ onClose }: PanelProps<'split'>) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <PanelHeader title='Smart split' onClose={onClose} />
      <p className='mt-10 font-serif text-4xl'>Smart split</p>
      <p className='mt-2 text-muted'>Coming soon</p>
    </div>
  );
}
