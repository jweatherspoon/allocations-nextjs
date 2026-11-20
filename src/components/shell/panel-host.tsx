'use client';

import { useEffect, useRef } from 'react';

import { NewFundPanel } from '@/components/panels/new-fund-panel';
import { QuickLogPanel } from '@/components/panels/quick-log-panel';
import { SettingsPanel } from '@/components/panels/settings-panel';
import { SmartSplitPanel } from '@/components/panels/smart-split-panel';
import {
  type PanelKind,
  type PanelRequest,
  usePanelHostState,
} from '@/components/shell/panel-context';

const LABELS: Record<PanelKind, string> = {
  quick: 'Log money',
  split: 'Smart split',
  new: 'New fund',
  settings: 'Settings',
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function renderPanel(request: PanelRequest, onClose: () => void) {
  switch (request.kind) {
    case 'quick':
      return <QuickLogPanel request={request} onClose={onClose} />;
    case 'split':
      return <SmartSplitPanel request={request} onClose={onClose} />;
    case 'new':
      return <NewFundPanel request={request} onClose={onClose} />;
    case 'settings':
      return <SettingsPanel request={request} onClose={onClose} />;
  }
}

/**
 * The full-screen slide-up sheet that hosts every panel. Rendered once by AppShell.
 * Panel roots should be `flex min-h-0 flex-1 flex-col`; the host supplies the padding.
 */
export function PanelHost() {
  const { rendered, visible, renderKey, close } = usePanelHostState();
  const sheet = useRef<HTMLDivElement>(null);
  const mounted = rendered !== null;

  // Scroll lock, focus handoff, Escape and Tab wrapping while the sheet is mounted.
  useEffect(() => {
    if (!mounted) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheet.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !sheet.current) return;
      const items = Array.from(
        sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === sheet.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [mounted, close]);

  if (!rendered) return null;

  return (
    <div
      ref={sheet}
      role='dialog'
      aria-modal='true'
      aria-label={LABELS[rendered.kind]}
      tabIndex={-1}
      className={`fixed inset-0 z-50 bg-bg outline-none transition-transform duration-[420ms] ease-[cubic-bezier(.2,.85,.25,1)] ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className='mx-auto flex h-full w-full max-w-[440px] flex-col px-[18px] pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-[calc(env(safe-area-inset-bottom,0px)+24px)]'>
        <div key={renderKey} className='flex min-h-0 flex-1 flex-col'>
          {renderPanel(rendered, close)}
        </div>
      </div>
    </div>
  );
}
