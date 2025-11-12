import Link from 'next/link';

import { getUserFunds } from '@/api/funds/funds.api';
import FundCard from '@/components/funds/list/fund-card';
import { FundsTitle } from '@/components/funds/list/funds-title';
import BottomNav from '@/components/navigation/bottom-nav';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import { CardStackSwiper } from '@/components/shared/swipers/card-stack-swiper';
import { PanoramicSwiper } from '@/components/shared/swipers/panoramic-swiper';

export default async function ListFundsPage() {
  const funds = await getUserFunds();
  const sortedFunds = funds.sort((a, b) => {
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

  const activeFunds = sortedFunds.filter((fund) => fund.status === 'active');
  const archivedFunds = sortedFunds.filter(
    (fund) => fund.status === 'archived'
  );

  const totalSaved = activeFunds.reduce(
    (acc, fund) => acc + (fund.currentAmount || 0),
    0
  );

  const activeFundCards = activeFunds.map((fund) => (
    <div key={fund.id}>
      <Link href={`/funds/${fund.id}/`}>
        <FundCard {...fund} />
      </Link>
    </div>
  ));

  const archivedFundCards = archivedFunds.map((fund) => (
    <div key={fund.id}>
      <Link href={`/funds/${fund.id}/`}>
        <FundCard {...fund} />
      </Link>
    </div>
  ));

  return (
    <TitledPageContainer title={<FundsTitle totalSaved={totalSaved} />}>
      <div className='mb-2 flex gap-2 items-center'>
        <h2 className='text-lg font-semibold text-midnight mb-2'>
          Active Funds
        </h2>
        <hr className='flex-grow border-t border-flame' />
      </div>
      {activeFunds.length === 0 ? (
        <p className='text-dusk'>No active funds available.</p>
      ) : (
        <PanoramicSwiper cards={activeFundCards} />
      )}

      <div className='mb-2 flex gap-2 items-center'>
        <h2 className='text-lg font-semibold text-midnight mb-2'>
          Archived Funds
        </h2>
        <hr className='flex-grow border-t border-flame' />
      </div>
      {archivedFunds.length === 0 ? (
        <div className=''>
          <p className='text-dusk text-center'>
            No funds have been archived yet.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          <CardStackSwiper cards={archivedFundCards} direction='horizontal' />
        </div>
      )}
      <BottomNav />
    </TitledPageContainer>
  );
}
