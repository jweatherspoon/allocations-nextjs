'use client';

import type { PanelProps } from '@/components/shell/panel-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { ToggleSwitch } from '@/components/ui/toggle-switch';

/** STUB (Phase 0): replaced by the New fund / Settings agent. Keep the export and props. */
export function SettingsPanel({ onClose }: PanelProps<'settings'>) {
  const { theme, setTheme } = usePreferences();

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex items-center justify-between'>
        <h2 className='font-serif text-4xl'>Settings</h2>
        <button
          type='button'
          aria-label='Close'
          onClick={onClose}
          className='h-11 w-11 rounded-full bg-chip'
        >
          ✕
        </button>
      </div>
      <p className='mt-2 text-muted'>Coming soon</p>
      <div className='mt-6 rounded-[20px] border border-line bg-surface px-4'>
        <ToggleSwitch
          label='Dark mode'
          checked={theme === 'dark'}
          onChange={(on) => setTheme(on ? 'dark' : 'light')}
        />
      </div>
    </div>
  );
}
