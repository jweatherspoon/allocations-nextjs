'use client';

import { useCallback, useState } from 'react';

import type { KeypadKey } from '@/components/ui/keypad';

export interface AmountInput {
  /** The typed string, e.g. "12.5" ('' when empty). */
  raw: string;
  /** Parsed number (0 when empty). */
  value: number;
  /** "$1,234.5" — what to show on screen ("$0" when empty). */
  display: string;
  press: (key: KeypadKey | string) => void;
  setRaw: (raw: string) => void;
  reset: () => void;
}

/** Keypad-driven amount entry (≤ 2 decimals, ≤ 7 digits). Port of the prototype's `press()`. */
export function useAmountInput(initial = ''): AmountInput {
  const [raw, setRaw] = useState(initial);

  const press = useCallback((k: string) => {
    setRaw((a) => {
      if (k === 'del') return a.slice(0, -1);
      if (k === '.') return a.includes('.') ? a : (a || '0') + '.';
      if (!/^\d$/.test(k)) return a;
      if (a.includes('.') && a.split('.')[1].length >= 2) return a;
      if (a.replace('.', '').length >= 7) return a;
      return a === '0' ? k : a + k;
    });
  }, []);

  const reset = useCallback(() => setRaw(''), []);

  const [ip, dp] = raw.split('.');
  const display =
    '$' +
    (ip ? Number(ip).toLocaleString('en-US') : '0') +
    (raw.includes('.') ? '.' + (dp || '') : '');

  return {
    raw,
    value: parseFloat(raw) || 0,
    display,
    press,
    setRaw,
    reset,
  };
}
