'use client';

import type { PanelProps } from '@/components/shell/panel-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { useUser } from '@/components/shell/user-context';
import { CloseIcon } from '@/components/ui/icons';
import { ToggleSwitch } from '@/components/ui/toggle-switch';

export function SettingsPanel({ onClose }: PanelProps<'settings'>) {
  const { theme, setTheme, hideBalances, toggleHideBalances } =
    usePreferences();
  const user = useUser();

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='mb-5 flex items-center justify-between'>
        <h2 className='font-serif text-4xl font-normal'>Settings</h2>
        <button
          type='button'
          aria-label='Close'
          onClick={onClose}
          className='grid h-11 w-11 place-items-center rounded-full bg-chip'
        >
          <CloseIcon />
        </button>
      </div>
      <div className='rounded-[20px] border border-line bg-surface px-4'>
        <ToggleSwitch
          label='Dark mode'
          checked={theme === 'dark'}
          onChange={(on) => setTheme(on ? 'dark' : 'light')}
          className='border-b border-line'
        />
        <ToggleSwitch
          label='Hide balances'
          checked={hideBalances}
          onChange={toggleHideBalances}
        />
      </div>
      <p className='mt-4 px-4 text-[13px] text-muted'>
        {user.name}
        {user.email ? ` · ${user.email}` : ''}
      </p>
      <a
        href='/auth/logout'
        className='block px-4 py-[18px] text-base font-semibold text-neg'
      >
        Sign out
      </a>
    </div>
  );
}
