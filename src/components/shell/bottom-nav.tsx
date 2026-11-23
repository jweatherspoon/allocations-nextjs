'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { usePanels } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { PlusIcon } from '@/components/ui/icons';

/** Plan · ＋ Log money · This month. Hidden on fund detail pages. */
export function BottomNav() {
  const pathname = usePathname();
  const { open } = usePanels();
  const { defaultQuickFundId } = usePortfolio();

  if (pathname.startsWith('/funds/')) return null;

  const tab = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`grid h-12 w-24 place-items-center text-center text-[13px] font-semibold ${
          active ? 'text-accent' : 'text-muted'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      aria-label='Main'
      className='fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0px)]'
    >
      <div className='mx-auto flex h-[74px] w-full max-w-[440px] items-center justify-between px-10'>
        {tab('/', 'Plan')}
        <button
          type='button'
          aria-label='Log money'
          onClick={() =>
            open({ kind: 'quick', fundId: defaultQuickFundId ?? undefined })
          }
          className='-mt-[34px] grid h-16 w-16 place-items-center rounded-[22px] bg-accent text-on-accent shadow-[0_10px_28px_var(--glow),0_0_0_1px_var(--line)] transition-transform active:scale-[.92]'
        >
          <PlusIcon width={26} height={26} />
        </button>
        {tab('/month', 'This month')}
      </div>
    </nav>
  );
}
