'use client';

import AddTransactionModal from '@/app/funds/[fundId]/_components/add-transaction-modal';
import FundTransactionCard from '@/app/funds/_components/fund-transaction-card';
import { FundDetails } from '@/app/lib/models/funds/fund.model';
import DetailsSectionContainer from '@/components/containers/sections/details-section-container';
import { useState } from 'react';

export default function FundTransactionDetailsSection({ fundDetails }: { fundDetails: FundDetails }) {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  return (
    <div>
      {/* Recent Transactions Section */}
      <DetailsSectionContainer>
        <div className='flex justify-between items-end mb-2'>
          <h3 className='text-lg text-midnight'>
            Recent Transactions
          </h3>
          <button
            className='p-1.5 rounded-full bg-flame text-cream hover:bg-opacity-90 transition-colors'
            aria-label='Add new transaction'
            onClick={() => setIsTransactionModalOpen(true)}
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
      </DetailsSectionContainer>
      <AddTransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
        onSave={async (data) => {
          // Here you would typically send the new transaction to your backend or update state
          console.log('New Transaction Data:', data);
        }}
      />
    </div>
  );
}