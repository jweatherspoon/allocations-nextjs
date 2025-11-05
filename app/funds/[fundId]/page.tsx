import FundTransactionCard from '@/app/funds/_components/fund-transaction-card';
import { getFundDetails } from '@/app/lib/funds/funds';
import StatusChip from '@/components/chip/status-chip';
import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import { ProgressBar } from '@/components/progress/progress-bar';
import { ChipStatus } from '@/models/status/chip-status.enum';
import { notFound } from 'next/navigation';

export default async function FundDetailsPage({
  params
}: {
  params: Promise<{ fundId: string }>;
}) {
  const { fundId } = await params;
  const fundDetails = await getFundDetails([fundId]).then((funds) => funds ? funds[0] : null);
  if (!fundDetails) {
    notFound();
  }

  const amountText = fundDetails.targetAmount ? 
    `$${fundDetails.currentAmount.toLocaleString()} / $${fundDetails.targetAmount.toLocaleString()}` :
    `$${fundDetails.currentAmount.toLocaleString()}`;

  const progressPercentage = fundDetails.targetAmount ?
    Math.min((fundDetails.currentAmount / fundDetails.targetAmount) * 100, 100) :
    null;

  const isOverdue = fundDetails.targetDate ? new Date(fundDetails.targetDate) < new Date() : false;
  const overdueStatus = isOverdue ? ChipStatus.ERROR : ChipStatus.SUCCESS;

  return (
    <TitledPageContainer title={fundDetails.name} subtitle={fundDetails.description}>
      {/* Current Amount / Progress Section */}
      <div className='p-4 bg-cream rounded-lg shadow-sm border border-gray-200'>
        <div className='flex justify-between items-start mb-1'>
          <h3 className='text-lg text-midnight'>
            Current Amount: 
          </h3>
          <span className='text-lg font-semibold text-midnight'>
            {amountText}
          </span>
        </div>
        {progressPercentage !== null && (
          <ProgressBar progress={progressPercentage} />
        )}
      </div>

      {/* Target Date Section */}
      {fundDetails.targetDate && (
        <div className='p-4 bg-cream rounded-lg shadow-sm border border-gray-200'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg text-midnight'>
              Target Date: 
              <span className='ml-2 text-lg font-semibold text-dusk'>
                {new Date(fundDetails.targetDate).toISOString().split('T')[0]}
              </span>
            </h3>
            <StatusChip status={overdueStatus} text={isOverdue ? 'overdue' : 'on track'} />
          </div>
      </div>
      )}

      {/* Trend Section */}
      <div className='p-4 bg-cream rounded-lg shadow-sm border border-gray-200'>
        <p className='text-dusk'>
          {/* Placeholder for trend chart or data */}
          Trend data and charts will be displayed here.
        </p>
      </div>

      {/* Recent Transactions Section */}
      <div className='p-4 bg-cream rounded-lg shadow-sm border border-gray-200'>
        <div className='flex justify-between items-end mb-2'>
          <h3 className='text-lg text-midnight'>
            Recent Transactions
          </h3>
          <button
            className='p-1.5 rounded-full bg-flame text-cream hover:bg-opacity-90 transition-colors'
            aria-label='Add new transaction'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
        <hr className='border-t border-flame mb-2' />
        <div className='space-y-3 overflow-y'>
          {fundDetails.transactions.length > 0 ? (
            fundDetails.transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10).map((transaction) => (
              <FundTransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <p className='text-dusk'>
              No recent transactions found.
            </p>
          )}
        </div>
      </div>

    </TitledPageContainer>
  );
  
}