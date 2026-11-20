'use client';

import { CloseIcon } from '@/components/ui/icons';

/** ✕ on the left, uppercase title in the centre, optional slot on the right. */
export function PanelHeader({
  title,
  onClose,
  right,
}: {
  title?: string;
  onClose: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between'>
      <button
        type='button'
        aria-label='Close'
        onClick={onClose}
        className='grid h-11 w-11 place-items-center rounded-full bg-chip'
      >
        <CloseIcon />
      </button>
      {title && (
        <span className='text-[13px] font-semibold tracking-[.06em] text-muted uppercase'>
          {title}
        </span>
      )}
      {right ?? <span className='w-11' />}
    </div>
  );
}
