import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import { getActiveFunds } from '../lib/funds/funds';

import FundCard from './_components/fund-card';
import Link from 'next/link';

export default async function ListFundsPage() {
  const activeFunds = await getActiveFunds();

  return (
    <TitledPageContainer title='Funds'>
      {activeFunds.length === 0 ? (
        <p className="text-gray-600">No active funds available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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