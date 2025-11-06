import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import { getActiveFunds } from '../lib/funds/funds';

import FundCard from './_components/fund-card';
import Link from 'next/link';

export default async function ListFundsPage() {
  const funds = await getActiveFunds();
  const activeFunds = funds.sort((a, b) => {
    if (a.rank !== b.rank) {
      if (a.rank == null) return 1;
      if (b.rank == null) return -1;
      return b.rank - a.rank;
    }

    if (a.targetDate !== b.targetDate) {
      if (a.targetDate == null) return 1;
      if (b.targetDate == null) return -1;
      return (
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <TitledPageContainer title='Funds'>
      {activeFunds.length === 0 ? (
        <p className='text-dusk'>No active funds available.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {activeFunds.map((fund) => (
            <Link key={fund.id} href={`/funds/${fund.id}/`}>
              <FundCard {...fund} />
            </Link>
          ))}
        </div>
      )}
    </TitledPageContainer>
  );
}
