import { getActiveFunds } from '@/app/lib/funds/funds';

import FundCard from '@/app/funds/_components/fund-card';
import Link from 'next/link';

export default async function ListFundsPage() {
  const activeFunds = await getActiveFunds();

  return (
    <div className="space-y-4">
      {/* {hierarchy.map((group) => (
        <GroupExpander key={group.id} group={group} />
      ))} */}
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
    </div>
  );
}