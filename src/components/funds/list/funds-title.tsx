'use client';

import { useEffect, useState } from 'react';

import { formatCurrency } from '@/utils/format.utils';

export function FundsTitle({ totalSaved }: { totalSaved: number }) {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    async function fetchHideTotals() {
      const hideTotals = localStorage?.getItem('hideTotals');
      setIsHidden(hideTotals === 'true');
    }

    fetchHideTotals();
  }, []);

  const hideTotals = (value: boolean) => {
    localStorage?.setItem('hideTotals', value ? 'true' : 'false');
    setIsHidden(value);
  };

  return (
    <h1 className='text-3xl font-bold text-midnight mb-2'>
      Funds
      <span
        onClick={() => hideTotals(!isHidden)}
        className='cursor-pointer select-none text-lg text-dusk ml-2'
      >
        ({isHidden ? '••••••••••' : formatCurrency(totalSaved)})
      </span>
    </h1>
  );
}
