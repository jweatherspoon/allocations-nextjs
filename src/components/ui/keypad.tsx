'use client';

export type KeypadKey =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '.'
  | '0'
  | 'del';

const KEYS: KeypadKey[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '.',
  '0',
  'del',
];

/** 3×4 numeric keypad. Pair with `useAmountInput().press`. */
export function Keypad({
  onPress,
  className = '',
}: {
  onPress: (key: KeypadKey) => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-3 gap-1 ${className}`}>
      {KEYS.map((k) => (
        <button
          key={k}
          type='button'
          aria-label={k === 'del' ? 'Delete' : k === '.' ? 'Decimal point' : k}
          onClick={() => onPress(k)}
          className='h-[54px] rounded-[14px] text-center font-mono text-2xl active:bg-chip'
        >
          {k === 'del' ? '⌫' : k}
        </button>
      ))}
    </div>
  );
}
